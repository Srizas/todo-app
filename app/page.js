'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Home, Plus, Trash2, Clock, BookOpen, Check, RefreshCw, Bell, BellOff, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate] = useState(new Date());
  const [notifEnabled, setNotifEnabled] = useState(false);

  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);

  // Formulaires
  const [newCourse, setNewCourse] = useState({ name: '', day: 'Lundi', start: '', end: '', room: '', repeat: 'Chaque semaine', color: 'indigo' });
  const [newTodo, setNewTodo] = useState({ text: '', dueDate: new Date().toLocaleDateString('fr-CA') });

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
    if (course.repeat === 'Une seule fois') return course.specificDate === targetISO;
    const dayName = daysOfWeek[(targetDateObj.getDay() + 6) % 7];
    return course.day === dayName;
  };

  const handleDeleteCourse = (course, dateISO) => {
    if (course.repeat === 'Une seule fois' || !window.confirm("Supprimer uniquement cette occurrence ? Annuler pour supprimer toute la série.")) {
      saveCourses(courses.filter(c => c.id !== course.id));
    } else {
      saveCourses(courses.map(c => c.id === course.id ? { ...c, exceptDates: [...(c.exceptDates || []), dateISO] } : c));
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + i;
    return new Date(d.setDate(diff));
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* HEADER NAVIGATION */}
      <nav className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-indigo-400">StudentDash</h1>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('home')} className={`p-2 rounded ${activeTab === 'home' ? 'bg-indigo-600' : 'bg-slate-800'}`}><Home size={20}/></button>
          <button onClick={() => setActiveTab('calendar')} className={`p-2 rounded ${activeTab === 'calendar' ? 'bg-indigo-600' : 'bg-slate-800'}`}><Calendar size={20}/></button>
          <button onClick={() => setActiveTab('todo')} className={`p-2 rounded ${activeTab === 'todo' ? 'bg-indigo-600' : 'bg-slate-800'}`}><CheckSquare size={20}/></button>
        </div>
      </nav>

      {/* --- SECTION HOME --- */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock/> Cours du jour</h2>
            {courses.filter(c => shouldShowCourseOnDate(c, todayDate)).map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg mb-2">
                <div><p className="font-bold">{c.name}</p><p className="text-sm text-slate-400">{c.start} - {c.end} | {c.room}</p></div>
                <button onClick={() => handleDeleteCourse(c, todayDate.toLocaleDateString('fr-CA'))} className="text-rose-400"><Trash2 size={18}/></button>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* --- SECTION CALENDRIER --- */}
      {activeTab === 'calendar' && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}><ChevronLeft/></button>
            <span className="font-bold">Semaine du {weekDays[0].toLocaleDateString()}</span>
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}><ChevronRight/></button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d, i) => (
              <div key={i} className="min-h-[200px] bg-slate-950 p-2 rounded border border-slate-800">
                <p className="text-xs text-center text-slate-500 uppercase">{daysOfWeek[i]}</p>
                {courses.filter(c => shouldShowCourseOnDate(c, d)).map(c => (
                  <div key={c.id} className="text-[10px] p-1 bg-indigo-900/50 rounded mb-1">{c.name}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION TODO --- */}
      {activeTab === 'todo' && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <form onSubmit={(e) => { e.preventDefault(); saveTodos([...todos, { ...newTodo, id: Date.now(), completed: false }]); }} className="flex gap-2 mb-6">
            <input className="bg-slate-800 p-2 rounded flex-1" placeholder="Nouvelle tâche..." onChange={e => setNewTodo({...newTodo, text: e.target.value})} />
            <button className="bg-emerald-600 p-2 rounded"><Plus/></button>
          </form>
          {todos.map(t => (
            <div key={t.id} className="flex justify-between p-3 bg-slate-800 rounded mb-2">
              <span className={t.completed ? 'line-through text-slate-500' : ''}>{t.text}</span>
              <button onClick={() => saveTodos(todos.filter(x => x.id !== t.id))} className="text-rose-400"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}