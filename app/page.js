'use client';

import React, { useState, useEffect } from 'react';
import { Home, Calendar, CheckSquare, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [weekOffset, setWeekOffset] = useState(0);
  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('courses') || '[]'));
    setTodos(JSON.parse(localStorage.getItem('todos') || '[]'));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('courses', JSON.stringify(courses));
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [courses, todos, isLoaded]);

  const addCourse = (e) => {
    e.preventDefault();
    const f = e.target;
    setCourses([...courses, { 
      id: Date.now(), name: f.name.value, day: f.day.value, 
      freq: f.freq.value, start: new Date().toISOString().split('T')[0], except: [] 
    }]);
    f.reset();
  };

  const isVisible = (c, date) => {
    if (c.except.includes(date.toISOString().split('T')[0])) return false;
    const diff = Math.floor((date - new Date(c.start)) / (1000 * 60 * 60 * 24 * 7));
    if (c.freq === 'jamais') return date.toISOString().split('T')[0] === c.start;
    if (c.freq === 'semaine') return true;
    if (c.freq === '2semaines') return diff % 2 === 0;
    if (c.freq === 'mois') return date.getDate() === new Date(c.start).getDate();
    return false;
  };

  const getWeek = (offset) => {
    const d = new Date(); d.setDate(d.getDate() + (offset * 7) - (d.getDay() - 1));
    return Array.from({ length: 7 }, (_, i) => { const day = new Date(d); day.setDate(day.getDate() + i); return day; });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 font-sans">
      <nav className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-50"><h1 className="font-bold text-indigo-400">StudentDash</h1></nav>
      <main className="p-4 max-w-lg mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Aujourd'hui</h2>
            {courses.filter(c => isVisible(c, new Date())).map(c => (
              <div key={c.id} className="bg-slate-900 p-4 rounded-xl flex justify-between">{c.name}</div>
            ))}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <form onSubmit={addCourse} className="bg-slate-900 p-4 rounded-xl space-y-2">
              <input name="name" placeholder="Nom du cours" className="w-full p-2 bg-slate-950 rounded" required />
              <select name="day" className="w-full p-2 bg-slate-950 rounded">{['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(d => <option key={d}>{d}</option>)}</select>
              <select name="freq" className="w-full p-2 bg-slate-950 rounded">
                <option value="jamais">Une seule fois</option>
                <option value="semaine">Chaque semaine</option>
                <option value="2semaines">Toutes les 2 semaines</option>
                <option value="mois">Tous les mois</option>
              </select>
              <button className="w-full bg-indigo-600 p-2 rounded font-bold">Ajouter</button>
            </form>
            <div className="flex justify-between items-center">
              <button onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft /></button>
              <span>Semaine {weekOffset}</span>
              <button onClick={() => setWeekOffset(o => o + 1)}><ChevronRight /></button>
            </div>
            {getWeek(weekOffset).map((d, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded">
                <p className="font-bold">{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][i]}</p>
                {courses.filter(c => c.day === ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i] && isVisible(c, d)).map(c => (
                  <div key={c.id} className="flex justify-between py-1">
                    {c.name}
                    <button onClick={() => setCourses(courses.map(x => x.id === c.id ? {...x, except: [...x.except, d.toISOString().split('T')[0]]} : x))} className="text-rose-500 text-xs">Suppr</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); setTodos([...todos, {id:Date.now(), text:e.target.t.value}]); e.target.reset(); }} className="flex gap-2">
              <input name="t" className="flex-1 p-2 bg-slate-900 rounded" required />
              <button className="bg-emerald-600 px-4 rounded"><Plus /></button>
            </form>
            {todos.map(t => <div key={t.id} className="p-3 bg-slate-900 rounded flex justify-between">{t.text}<button onClick={() => setTodos(todos.filter(x => x.id !== t.id))} className="text-rose-500"><Trash2 size={16}/></button></div>)}
          </div>
        )}
      </main>
      <div className="fixed bottom-0 w-full bg-slate-900 p-4 flex justify-around border-t border-slate-800">
        <button onClick={() => setActiveTab('home')}><Home /></button>
        <button onClick={() => setActiveTab('calendar')}><Calendar /></button>
        <button onClick={() => setActiveTab('todo')}><CheckSquare /></button>
      </div>
    </div>
  );
}