import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample family-friendly memories
const sampleMemories = [
  {
    title: "Building the Perfect Sandcastle",
    story: "We spent the entire afternoon at Sunset Beach building what we declared to be the most magnificent sandcastle ever constructed. Complete with towers, a moat, and even tiny seashell decorations, it was our masterpiece. The kids worked together like architects, each taking charge of different sections. When the tide started coming in, instead of being sad, we cheered as the waves gently reclaimed our creation. Sometimes the best memories are the ones that don't last forever.",
    location: {
      lat: 33.7701,
      lng: -118.4109,
      name: "Sunset Beach, California"
    },
    imageData: null
  },
  {
    title: "First Day of School Pancakes",
    story: "Every first day of school starts the same way in our house - with Mickey Mouse shaped pancakes and way too much syrup. This year was extra special because it was little Emma's first day of kindergarten. She insisted on wearing her sparkly shoes and carrying her new backpack that was almost as big as she was. We took about a hundred photos on the front porch, and she was so excited she could barely sit still long enough to eat breakfast. These traditions make the big moments feel even more magical.",
    location: {
      lat: 40.7589,
      lng: -73.9851,
      name: "Central Park West, New York, NY"
    },
    imageData: null
  },
  {
    title: "Grandpa's Secret Cookie Recipe",
    story: "Grandpa finally shared his famous chocolate chip cookie recipe with us today. Turns out the secret ingredient was a pinch of sea salt and an extra egg yolk - who knew? We spent the whole afternoon in his kitchen, flour everywhere, taking turns mixing the dough and sneaking tastes when he wasn't looking (though I'm pretty sure he saw us every time). The best part wasn't even the cookies, it was listening to his stories about baking with his own grandmother when he was young. Some recipes are about more than just food.",
    location: {
      lat: 41.8781,
      lng: -87.6298,
      name: "Lincoln Park, Chicago, IL"
    },
    imageData: null
  },
  {
    title: "The Great Backyard Camping Adventure",
    story: "We pitched our tent right in the backyard and declared it the wilderness. Armed with flashlights, s'mores supplies, and sleeping bags, we were ready for our grand adventure. The kids insisted we were 'miles from civilization' even though we could see the kitchen window from our campsite. We told ghost stories, counted stars, and listened to the sounds of the night (mostly just the neighbor's cat). When it started to rain at 2 AM, we made the executive decision that real explorers know when to retreat to the house. Best camping trip ever.",
    location: {
      lat: 30.2672,
      lng: -97.7431,
      name: "Austin, Texas"
    },
    imageData: null
  }
];

export const addSampleMemories = async (userId) => {
  try {
    console.log('Adding sample memories for user:', userId);
    
    const memoriesWithUser = sampleMemories.map(memory => ({
      ...memory,
      userId: userId,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      updatedAt: new Date()
    }));

    const promises = memoriesWithUser.map(memory => 
      addDoc(collection(db, 'memories'), memory)
    );

    await Promise.all(promises);
    console.log('Sample memories added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample memories:', error);
    throw error;
  }
};

export const clearUserMemories = async (userId) => {
  try {
    console.log('Clearing existing memories for user:', userId);
    
    const q = query(collection(db, 'memories'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${querySnapshot.docs.length} existing memories`);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error clearing memories:', error);
    throw error;
  }
};

export const replaceSampleMemories = async (userId) => {
  try {
    // First clear existing memories
    const deletedCount = await clearUserMemories(userId);
    console.log(`Cleared ${deletedCount} existing memories`);
    
    // Then add sample memories
    await addSampleMemories(userId);
    console.log('Sample memories replacement complete!');
    
    return {
      deleted: deletedCount,
      added: sampleMemories.length
    };
  } catch (error) {
    console.error('Error replacing memories:', error);
    throw error;
  }
};