// setup.js
const PocketBase = require('pocketbase').default;

async function setup() {
  const pb = new PocketBase('http://127.0.0.1:8090');
  
  try {
    // Войдите как админ (создайте первого админа через админку)
    await pb.admins.authWithPassword('admin@example.com', 'ваш_пароль');
    
    // Создаем коллекции по одной
    const collections = [
      {
        name: 'profiles',
        type: 'base',
        schema: [
          { name: 'user', type: 'relation', required: true, options: { maxSelect: 1, collectionId: '_pb_users_auth_', cascadeDelete: true } },
          { name: 'username', type: 'text' },
          { name: 'full_name', type: 'text' },
          { name: 'rating', type: 'number', options: { min: 0, max: 5 } },
          { name: 'help_count', type: 'number', options: { min: 0 } },
          { name: 'meetup_count', type: 'number', options: { min: 0 } }
        ]
      },
      {
        name: 'events',
        type: 'base',
        schema: [
          { name: 'organizer', type: 'relation', required: true, options: { maxSelect: 1, collectionId: '_pb_users_auth_', cascadeDelete: true } },
          { name: 'title', type: 'text', required: true, options: { min: 3, max: 100 } },
          { name: 'description', type: 'text', options: { max: 1000 } },
          { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['meetup', 'help'] } },
          { name: 'status', type: 'select', options: { maxSelect: 1, values: ['active', 'completed', 'cancelled'] } },
          { name: 'category', type: 'select', options: { maxSelect: 1, values: ['sport', 'food', 'art', 'repair', 'moving', 'garden'] } },
          { name: 'address', type: 'text', required: true },
          { name: 'latitude', type: 'number' },
          { name: 'longitude', type: 'number' },
          { name: 'starts_at', type: 'date', required: true },
          { name: 'ends_at', type: 'date' },
          { name: 'max_participants', type: 'number', required: true, options: { min: 1 } },
          { name: 'current_participants', type: 'number', options: { min: 0 } },
          { name: 'is_paid', type: 'bool' },
          { name: 'price', type: 'number' },
          { name: 'price_negotiable', type: 'bool' }
        ]
      }
    ];

    for (const collection of collections) {
      try {
        await pb.collections.create(collection);
        console.log(`✅ Created ${collection.name}`);
      } catch (e) {
        console.log(`❌ ${collection.name}: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

setup();