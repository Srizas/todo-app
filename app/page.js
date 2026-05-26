'use client';

import React, { useState, useEffect } from 'react';
import { Home, Calendar, CheckSquare, Trash2, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Palette } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [offset, setOffset] = useState(0);
  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('courses') || '[]'));
    setTodos(JSON.parse(localStorage.getItem('todos') || '[]'));
  }, []);

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [courses, todos]);

  const addCourse = (e) => {
    e.preventDefault();
    const f = e.target;
    setCourses([...courses, { 
      id: Date.now(), name: f.name.value, day: f.day.value, freq: f.freq.value,
      start: f.start.value, end: f.end.value, room: f.room.value, color: f.color.value,
      startDate: new Date().toISOString().split('T')[0], except: [] 
    }]);
    f.reset();
  };

  const getWeekDates = (off) => {
    const d = new Date();
    d.setDate(d.getDate() + (off * 7) - (d.getDay() === 0 ? 6 : d.getDay() - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(d);
      day.setDate(day.getDate() + i);
      return day;
    });
  };

  const week = getWeekDates(offset);
  const range = `${week[0].toLocaleDateString('fr-FR', {day:'numeric', month:'long'})} au ${week[6].toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'})}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 font-sans">
      <nav className="p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50 font-bold text-indigo-400">StudentDash</nav>
      
      <main className="p-4 max-w-lg mx-auto space-y-6">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Aujourd'hui</h2>
            {courses.map(c => <div key={c.id} className="p-4 bg-slate-900 rounded-xl border-l-4" style={{borderColor: c.color}}>{c.name} - {c.start}</div>)}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <form onSubmit={addCourse} className="bg-slate-900 p-4 rounded-xl space-y-2 text-sm">
              <input name="name" placeholder="Nom" className="w-full p-2 bg-slate-950 rounded" required />
              <div className="flex gap-2">
                <input name="start" type="time" className="w-1/2 p-2 bg-slate-950 rounded" required />
                <input name="end" type="time" className="w-1/2 p-2 bg-slate-950 rounded" required />
              </div>
              <input name="room" placeholder="Salle" className="w-full p-2 bg-slate-950 rounded" />
              <select name="day" className="w-full p-2 bg-slate-950 rounded">{['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map(d => <option key={d}>{d}</option>)}</select>
              <select name="freq" className="w-full p-2 bg-slate-950 rounded">
                <option value="semaine">Chaque semaine</option>
                <option value="2semaines">Toutes les 2 semaines</option>
                <option value="mois">Tous les mois</option>
              </select>
              <input name="color" type="color" className="w-full h-8 bg-slate-950 rounded" />
              <button className="w-full bg-indigo-600 p-2 rounded font-bold">Ajouter</button>
            </form>

            <div className="flex justify-between items-center text-sm font-bold">
              <button onClick={() => setOffset(o => o - 1)}><ChevronLeft/></button>
              <span>{range}</span>
              <button onClick={() => setOffset(o => o + 1)}><ChevronRight/></button>
            </div>
            {week.map((d, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <p className="text-indigo-400 font-bold mb-2">{['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]} {d.getDate()}</p>
                {courses.filter(c => c.day === ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]).map(c => (
                  <div key={c.id} className="flex justify-between items-center bg-slate-950 p-2 my-1 rounded text-xs">
                    <div>{c.name} <span className="opacity-50">({c.start} - {c.room})</span></div>
                    <button onClick={() => setCourses(courses.filter(x => x.id !== c.id))} className="text-rose-500"><Trash2 size={14}/></button>
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
              <button className="bg-emerald-600 px-4 rounded"><Plus/></button>
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