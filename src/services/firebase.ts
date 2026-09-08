import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// User Auth & Profile Firestore Operations
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  // Ensure profile exists in Firestore
  await ensureUserProfileInFirestore(user);
  return user;
};

export const ensureUserProfileInFirestore = async (fbUser: FirebaseUser, extraInfo?: any) => {
  try {
    const userRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newUserProfile = {
        id: fbUser.uid,
        email: fbUser.email || '',
        username: extraInfo?.username || (fbUser.email ? fbUser.email.split('@')[0] : 'viber_' + fbUser.uid.slice(0, 5)),
        fullname: extraInfo?.fullname || fbUser.displayName || 'VibeSpark Creator',
        tagline: extraInfo?.tagline || '⚡ New VibeSpark Innovator',
        level: 1,
        xp: 0,
        followersCount: 0, // Default 0 on new account creation as requested
        followingCount: 0, // Default 0
        vibesReceived: 0,
        avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
        disciplineColor: 'ring-orange-500 text-orange-500',
        bio: extraInfo?.bio || 'Building future creative projects on VibeSpark.',
        projects: [],
        achievements: [{ title: '🚀 Vibe Sparked', desc: 'Created account on VibeSpark.' }],
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, newUserProfile);
      return newUserProfile;
    } else {
      return snap.data();
    }
  } catch (err) {
    console.warn("Error ensuring user profile in Firestore:", err);
    return null;
  }
};

export const saveUserProfileInFirestore = async (userId: string, profileData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profileData, { merge: true });
  } catch (err) {
    console.error("Error saving user profile in Firestore:", err);
  }
};

export const subscribeToUserProfile = (userId: string, callback: (profile: any) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
};

export const followUserInFirestore = async (currentUserId: string, targetUserId: string, isFollowing: boolean) => {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    await updateDoc(currentUserRef, {
      followingCount: increment(isFollowing ? -1 : 1)
    });
    
    await updateDoc(targetUserRef, {
      followersCount: increment(isFollowing ? -1 : 1)
    });
  } catch (err) {
    console.warn("Error updating follow state in Firestore:", err);
  }
};

// Helper for initial seed posts if database is fresh
export const seedInitialPostsIfEmpty = async (initialPosts: any[]) => {
  try {
    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);
    if (snapshot.empty) {
      for (const p of initialPosts) {
        const idStr = String(p.id);
        await setDoc(doc(db, 'posts', idStr), {
          ...p,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.warn("Firestore seed warning:", err);
  }
};

// Helper for initial seed challenges if database is fresh
export const seedInitialChallengesIfEmpty = async (initialChallenges: any[]) => {
  try {
    const challengesRef = collection(db, 'challenges');
    const snapshot = await getDocs(challengesRef);
    if (snapshot.empty) {
      for (const c of initialChallenges) {
        const idStr = String(c.id);
        await setDoc(doc(db, 'challenges', idStr), {
          ...c,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.warn("Firestore challenges seed warning:", err);
  }
};

// Helper for initial seed labs if database is fresh
export const seedInitialLabsIfEmpty = async (initialLabs: any[]) => {
  try {
    const labsRef = collection(db, 'labs');
    const snapshot = await getDocs(labsRef);
    if (snapshot.empty) {
      for (const l of initialLabs) {
        const idStr = String(l.id);
        await setDoc(doc(db, 'labs', idStr), {
          ...l,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.warn("Firestore labs seed warning:", err);
  }
};

export const createPostInFirestore = async (postData: any) => {
  try {
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      ...postData,
      createdAt: serverTimestamp()
    });
    return { ...postData, id: docRef.id };
  } catch (err) {
    console.error("Error creating post in Firestore:", err);
    throw err;
  }
};

export const createChallengeInFirestore = async (challengeData: any) => {
  try {
    const challengesRef = collection(db, 'challenges');
    const docRef = await addDoc(challengesRef, {
      ...challengeData,
      createdAt: serverTimestamp()
    });
    return { ...challengeData, id: docRef.id };
  } catch (err) {
    console.error("Error creating challenge in Firestore:", err);
    throw err;
  }
};

export const createLabInFirestore = async (labData: any) => {
  try {
    const labsRef = collection(db, 'labs');
    const docRef = await addDoc(labsRef, {
      ...labData,
      createdAt: serverTimestamp()
    });
    return { ...labData, id: docRef.id };
  } catch (err) {
    console.error("Error creating lab project in Firestore:", err);
    throw err;
  }
};

export const vibePostInFirestore = async (postId: string | number, userVibed: boolean, newVibeCount: number) => {
  try {
    const postRef = doc(db, 'posts', String(postId));
    await updateDoc(postRef, {
      userVibed,
      vibes: newVibeCount
    });
  } catch (err) {
    console.warn("Error updating vibes in Firestore:", err);
  }
};

export const addCommentInFirestore = async (postId: string | number, commentObj: { user: string; text: string }) => {
  try {
    const postRef = doc(db, 'posts', String(postId));
    await updateDoc(postRef, {
      comments: arrayUnion(commentObj)
    });
  } catch (err) {
    console.warn("Error adding comment in Firestore:", err);
  }
};

// Helper to seed initial notifications in Firestore if empty
export const seedInitialNotificationsIfEmpty = async (initialNotifications: any[]) => {
  try {
    const notifsRef = collection(db, 'notifications');
    const snapshot = await getDocs(notifsRef);
    if (snapshot.empty) {
      for (const n of initialNotifications) {
        const idStr = String(n.id);
        await setDoc(doc(db, 'notifications', idStr), {
          ...n,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.warn("Firestore notifications seed warning:", err);
  }
};

// Real-time listener for notifications in Firestore
export const subscribeToNotifications = (callback: (notifications: any[]) => void) => {
  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    }, (err) => {
      console.warn("Firestore notification subscription error:", err);
      // Fallback fallback query without order if index is building
      onSnapshot(notifsRef, (snap) => {
        const fallbackItems: any[] = [];
        snap.forEach((d) => fallbackItems.push({ id: d.id, ...d.data() }));
        callback(fallbackItems);
      });
    });
  } catch (err) {
    console.warn("Error subscribing to notifications:", err);
    return () => {};
  }
};

// Create a new notification in Firestore
export const sendNotificationInFirestore = async (notificationData: any) => {
  try {
    const notifsRef = collection(db, 'notifications');
    await addDoc(notifsRef, {
      ...notificationData,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Error sending notification to Firestore:", err);
  }
};

// Real-time listener for Posts
export const subscribeToPosts = (callback: (posts: any[]) => void) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    }, (err) => {
      console.warn("Firestore posts query fallback:", err);
      return onSnapshot(postsRef, (snap) => {
        const fallbackItems: any[] = [];
        snap.forEach((d) => fallbackItems.push({ id: d.id, ...d.data() }));
        callback(fallbackItems);
      });
    });
  } catch (err) {
    console.warn("Error subscribing to posts:", err);
    return () => {};
  }
};

// Real-time listener for Chats (DMs & Buddy)
export const subscribeToChats = (callback: (chats: any[]) => void) => {
  try {
    const chatsRef = collection(db, 'chats');
    return onSnapshot(chatsRef, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    });
  } catch (err) {
    console.warn("Error subscribing to chats:", err);
    return () => {};
  }
};

export const saveChatMessageInFirestore = async (chatId: string | number, messageObj: any) => {
  try {
    const chatRef = doc(db, 'chats', String(chatId));
    await setDoc(chatRef, {
      id: chatId,
      lastMsg: `${messageObj.sender}: ${messageObj.text || 'Media'}`,
      time: 'Just now',
      messages: arrayUnion(messageObj)
    }, { merge: true });
  } catch (err) {
    console.warn("Error saving chat message in Firestore:", err);
  }
};

// Real-time listener for Groups
export const subscribeToGroups = (callback: (groups: any[]) => void) => {
  try {
    const groupsRef = collection(db, 'groups');
    return onSnapshot(groupsRef, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    });
  } catch (err) {
    console.warn("Error subscribing to groups:", err);
    return () => {};
  }
};

export const createGroupInFirestore = async (groupData: any) => {
  try {
    const groupsRef = collection(db, 'groups');
    const docRef = await addDoc(groupsRef, {
      ...groupData,
      createdAt: serverTimestamp()
    });
    return { ...groupData, id: docRef.id };
  } catch (err) {
    console.warn("Error creating group in Firestore:", err);
    return groupData;
  }
};

export const saveGroupMessageInFirestore = async (groupId: string | number, messageObj: any) => {
  try {
    const groupRef = doc(db, 'groups', String(groupId));
    await updateDoc(groupRef, {
      messages: arrayUnion(messageObj)
    });
  } catch (err) {
    console.warn("Error saving group message in Firestore:", err);
  }
};

// Real-time user stats increment in Firestore
export const incrementUserVibesAndXPInFirestore = async (userId: string, vibeCountInc = 0, xpInc = 0) => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      vibesReceived: increment(vibeCountInc),
      xp: increment(xpInc)
    });
  } catch (err) {
    console.warn("Error incrementing user stats in Firestore:", err);
  }
};

export { onAuthStateChanged };


