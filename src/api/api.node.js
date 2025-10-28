const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json"); // adjust path to your JSON key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const todosCollection = db.collection("todos");

async function getTodos() {
  const snapshot = await todosCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addTodo(task) {
  const docRef = await todosCollection.add({ task, completed: false });
  return { id: docRef.id, task, completed: false };
}

async function updateTodo(id, updates) {
  const todoDoc = todosCollection.doc(id);
  await todoDoc.update(updates);
  return { id, ...updates };
}

async function deleteTodo(id) {
  const todoDoc = todosCollection.doc(id);
  await todoDoc.delete();
  return true;
}

module.exports = { getTodos, addTodo, updateTodo, deleteTodo };
