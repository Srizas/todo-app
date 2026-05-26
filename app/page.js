"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Home, Plus, Trash2, Clock, BookOpen, Check, RefreshCw, Bell, BellOff, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [notifPermission, setNotifPermission] = useState('default');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate, setTodayDate] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', day: 'Lundi', start: '', end: '', room: '', repeat: 'Chaque semaine', color: 'indigo' });
  const [newTodo, setNewTodo] = useState({ text: '', dueDate: new Date().toLocaleDateString('fr-CA') });

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const colors = [
    { id: 'indigo', label: 'Bleu/Indigo', bg: 'bg-indigo-600', text: 'text-indigo-400', border: 'border-indigo-500/30', hover: 'hover:border-indigo-500/60', badge: 'bg-indigo-500/10 text-indigo-300' },
    { id: 'emerald', label: 'Vert/Émeraude', bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500/30', hover: 'hover:border-emerald-500/60', badge: 'bg-emerald-500/10 text-emerald-300' },
    { id: 'amber', label: 'Orange/Ambre', bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500/30', hover: 'hover:border-amber-500/60', badge: 'bg-amber-500/10 text-amber-300' },
    { id: 'rose', label: 'Rouge/Rose', bg: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-500/30', hover: 'hover:border-rose-500/60', badge: 'bg-rose-500/10 text-rose-300' },
  ];

  const getColorStyles = (colorId) => colors.find(c => c.id === colorId) || colors[0];

  useEffect(() => {
    setTodayDate(new Date());
    if ('Notification' in window) setNotifPermission(Notification.permission);
    const savedCourses = localStorage.getItem('student_dash_courses');
    const savedTodos = localStorage.getItem('student_dash_todos');
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedTodos) setTodos(JSON.parse(savedTodos));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('student_dash_courses', JSON.stringify(courses));
  }, [courses, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('student_dash_todos', JSON.stringify(todos));
  }, [todos, isLoaded]);

  const getSortableTime = (timeString) => {
    if (!timeString) return 0;
    const parts = timeString.toLowerCase().split(/[h:.,\s]+/);
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  };

  const shouldShowCourseOnDate = (course, targetDateObj) => {
    const targetISO = targetDateObj.toLocaleDateString('fr-CA');
    if (course.exceptDates?.includes(targetISO)) return false;
    if (course.repeat === 'Une seule fois') return course.specificDate === targetISO;
    const dayName = daysOfWeek[(targetDateObj.getDay() + 6) % 7];
    if (course.day !== dayName) return false;
    const start = new Date(course.createdDate || targetISO);
    start.setHours(0, 0, 0, 0);
    return targetDateObj >= start;
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    setCourses([...courses, { ...newCourse, id: Date.now(), createdDate: new Date().toLocaleDateString('fr-CA'), exceptDates: [] }]);
    setNewCourse({ name: '', day: 'Lundi', start: '', end: '', room: '', repeat: 'Chaque semaine', color: 'indigo' });
  };

  const handleDeleteCourseClick = (course, dateISO) => {
    setCourses(courses.map(c => c.id === course.id ? { ...c, exceptDates: [...(c.exceptDates || []), dateISO] } : c));
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    setTodos([...todos, { ...newTodo, id: Date.now(), completed: false }]);
    setNewTodo({ text: '', dueDate: todayDate.toLocaleDateString('fr-CA') });
  };

  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const todayISO = todayDate.toLocaleDateString('fr-CA');
  const todayCourses = courses.filter(c => shouldShowCourseOnDate(c, todayDate)).sort((a, b) => getSortableTime(a.start) - getSortableTime(b.start));
  const todayTodos = todos.filter(t => t.dueDate === todayISO && !t.completed);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold">S</div>
            <span className="text-xl font-bold">StudentDash</span>
          </div>
          <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700/50">
            {['home', 'calendar', 'todo'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                {tab === 'home' ? 'Aujourd\'hui' : tab === 'calendar' ? 'Calendrier' : 'To-Do'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-extrabold">Au programme aujourd'hui 📅</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-indigo-400">Cours ({todayCourses.length})</h2>
                {todayCourses.map(course => (
                  <div key={course.id} className="bg-slate-900/60 p-3.5 mb-2 rounded-lg border border-slate-700 flex justify-between">
                    <div>
                      <p className="font-semibold text-indigo-400">{course.name}</p>
                      <p className="text-xs text-slate-400">{course.start} - {course.end}</p>
                    </div>
                    <button onClick={() => handleDeleteCourseClick(course, todayISO)}><Trash2 size={14} className="text-slate-500 hover:text-rose-400" /></button>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-emerald-400">À faire ({todayTodos.length})</h2>
                {todayTodos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between bg-slate-900/60 p-3.5 mb-2 rounded-lg border border-slate-700">
                    <span className="text-sm">{todo.text}</span>
                    <button onClick={() => toggleTodo(todo.id)} className="w-5 h-5 rounded-md border border-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCourse} className="bg-slate-800 rounded-xl p-5 border border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="text" placeholder="Nom du cours" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input type="text" placeholder="Début (ex: 08:30)" value={newCourse.start} onChange={e => setNewCourse({...newCourse, start: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input type="text" placeholder="Fin (ex: 10:00)" value={newCourse.end} onChange={e => setNewCourse({...newCourse, end: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <button type="submit" className="bg-indigo-600 rounded-lg text-sm font-bold">Ajouter</button>
            </form>
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleAddTodo} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex gap-3">
              <input type="text" placeholder="Tâche..." value={newTodo.text} onChange={e => setNewTodo({...newTodo, text: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm" />
              <button type="submit" className="bg-emerald-600 px-4 py-2 rounded-lg text-sm font-bold">Ajouter</button>
            </form>
            <div className="mt-4 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              {todos.map(todo => (
                <div key={todo.id} className="p-4 border-b border-slate-700 flex justify-between">
                  <span>{todo.text}</span>
                  <button onClick={() => toggleTodo(todo.id)} className={todo.completed ? 'text-emerald-500' : 'text-slate-500'}>Terminé</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}