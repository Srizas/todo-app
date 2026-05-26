'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Home, Plus, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate] = useState(new Date());
  
  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);

  // Formulaires (états pour saisir les nouvelles données)
  const [newCourse, setNewCourse] = useState({ name: '', day: 'Lundi', start: '', end: '', room: '', repeat: 'Chaque semaine' });
  const [newTodo, setNewTodo] = useState({ text: '' });

  // --- PERSISTANCE ---
  useEffect(() => {
    const savedCourses = localStorage.getItem('student_dash_courses');
    const savedTodos = localStorage.getItem('student_dash_todos');
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedTodos) setTodos(JSON.parse(savedTodos));
  }, []);

  const saveCourses = (data) => { setCourses(data); localStorage.setItem('student_dash_courses', JSON.stringify(data)); };
  const saveTodos = (data) => { setTodos(data); localStorage.setItem('student_dash_todos', JSON.stringify(data)); };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const shouldShowCourseOnDate = (course, targetDateObj) => {
    const targetISO = targetDateObj.toLocaleDateString('fr-CA');
    if (course.exceptDates?.includes(targetISO)) return false;
    const dayName = daysOfWeek[(targetDateObj.getDay() + 6) % 7];
    return course.day === dayName;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
      {/* HEADER */}
      <nav className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-indigo-400">StudentDash</h1>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('home')} className={`p-2 rounded ${activeTab === 'home' ? 'bg-indigo-600' : 'bg-slate-800'}`}><Home size={20}/></button>
          <button onClick={() => setActiveTab('calendar')} className={`p-2 rounded ${activeTab === 'calendar' ? 'bg-indigo-600' : 'bg-slate-800'}`}><Calendar size={20}/></button>
          <button onClick={() => setActiveTab('todo')} className={`p-2 rounded ${activeTab === 'todo' ? 'bg-indigo-600' : 'bg-slate-800'}`}><CheckSquare size={20}/></button>
        </div>
      </nav>

      {/* --- SECTION HOME --- */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <form className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2" onSubmit={(e) => { e.preventDefault(); saveCourses([...courses, { ...newCourse, id: Date.now(), exceptDates: [] }]); }}>
            <input className="w-full bg-slate-800 p-2 rounded" placeholder="Nom du cours" onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
            <div className="flex gap-2">
              <select className="bg-slate-800 p-2 rounded flex-1" onChange={e => setNewCourse({...newCourse, day: e.target.value})}>{daysOfWeek.map(d => <option key={d}>{d}</option>)}</select>
              <input className="bg-slate-800 p-2 rounded w-20" placeholder="Heure" onChange={e => setNewCourse({...newCourse, start: e.target.value})} />
              <button className="bg-indigo-600 px-4 rounded"><Plus/></button>
            </div>
          </form>

          <section className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Clock/> Cours du jour</h2>
            {courses.filter(c => shouldShowCourseOnDate(c, todayDate)).map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg mb-2">
                <span>{c.name} ({c.start})</span>
                <button onClick={() => saveCourses(courses.filter(x => x.id !== c.id))} className="text-rose-400"><Trash2 size={16}/></button>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* --- SECTION CALENDRIER (Squelette) --- */}
      {activeTab === 'calendar' && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-center text-slate-500">Vue Calendrier activée</p>
        </div>
      )}

      {/* --- SECTION TODO --- */}
      {activeTab === 'todo' && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <form className="flex gap-2 mb-4" onSubmit={(e) => { e.preventDefault(); saveTodos([...todos, { ...newTodo, id: Date.now() }]); }}>
            <input className="bg-slate-800 p-2 rounded flex-1" placeholder="Nouvelle tâche..." onChange={e => setNewTodo({...newTodo, text: e.target.value})} />
            <button className="bg-emerald-600 p-2 px-4 rounded"><Plus/></button>
          </form>
          {todos.map(t => (
            <div key={t.id} className="flex justify-between p-3 bg-slate-800 rounded mb-2">
              <span>{t.text}</span>
              <button onClick={() => saveTodos(todos.filter(x => x.id !== t.id))} className="text-rose-400"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}