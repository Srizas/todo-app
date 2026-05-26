'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Home, Plus, Trash2, Clock, BookOpen, Check, RefreshCw, Bell, BellOff, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Formulaire cours
  const [newCourse, setNewCourse] = useState({ name: '', day: 'Lundi', start: '', end: '', room: '', repeat: 'Chaque semaine', color: 'indigo' });
  // Formulaire todo
  const [newTodo, setNewTodo] = useState({ text: '', dueDate: new Date().toLocaleDateString('fr-CA') });

  // --- CHARGEMENT ---
  useEffect(() => {
    const savedCourses = localStorage.getItem('student_dash_courses');
    const savedTodos = localStorage.getItem('student_dash_todos');
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedTodos) setTodos(JSON.parse(savedTodos));
    setIsLoaded(true);
  }, []);

  // --- SAUVEGARDE AUTO ---
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('student_dash_courses', JSON.stringify(courses));
      localStorage.setItem('student_dash_todos', JSON.stringify(todos));
    }
  }, [courses, todos, isLoaded]);

  // --- ACTIONS ---
  const handleAddCourse = (e) => {
    e.preventDefault();
    setCourses([...courses, { ...newCourse, id: Date.now(), exceptDates: [] }]);
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    setTodos([...todos, { ...newTodo, id: Date.now(), completed: false }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      {/* MENU */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('home')} className="bg-indigo-600 p-2 rounded">Accueil</button>
        <button onClick={() => setActiveTab('calendar')} className="bg-indigo-600 p-2 rounded">Calendrier</button>
        <button onClick={() => setActiveTab('todo')} className="bg-indigo-600 p-2 rounded">To-Do</button>
      </div>

      {/* CONTENU */}
      {activeTab === 'home' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Cours du jour</h2>
          {courses.map(c => <div key={c.id} className="bg-slate-800 p-2 mb-2 rounded">{c.name} - {c.start}</div>)}
        </div>
      )}

      {activeTab === 'calendar' && (
        <form onSubmit={handleAddCourse} className="bg-slate-900 p-4 rounded">
          <input className="text-black mb-2 block" placeholder="Nom du cours" onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
          <button type="submit" className="bg-green-600 p-2 rounded">Ajouter Cours</button>
        </form>
      )}

      {activeTab === 'todo' && (
        <form onSubmit={handleAddTodo} className="bg-slate-900 p-4 rounded">
          <input className="text-black mb-2 block" placeholder="Tâche" onChange={e => setNewTodo({...newTodo, text: e.target.value})} />
          <button type="submit" className="bg-green-600 p-2 rounded">Ajouter Tâche</button>
          <div className="mt-4">
            {todos.map(t => <div key={t.id} className="bg-slate-800 p-2 mb-2 rounded">{t.text}</div>)}
          </div>
        </form>
      )}
    </div>
  );
}