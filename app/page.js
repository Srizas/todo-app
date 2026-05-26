"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Home, Plus, Trash2, Clock, BookOpen, Check, RefreshCw, Bell, BellOff, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export default function App() {
  // --- ÉTATS PRINCIPAUX ---
  const [activeTab, setActiveTab] = useState('home');
  const [notifPermission, setNotifPermission] = useState('default');
  
  // NAVIGATION DE SEMAINES : Gère la date pivot de l'application
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate, setTodayDate] = useState(new Date());

  // États des cours et des tâches
  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Formulaire d'ajout de cours
  const [newCourse, setNewCourse] = useState({ 
    name: '', 
    day: 'Lundi', 
    start: '', 
    end: '',   
    room: '', 
    repeat: 'Chaque semaine', 
    color: 'indigo' 
  });
  
  // Formulaire d'ajout de To-Do avec date
  const [newTodo, setNewTodo] = useState({ text: '', dueDate: new Date().toLocaleDateString('fr-CA') });

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const colors = [
    { id: 'indigo', label: 'Bleu/Indigo', bg: 'bg-indigo-600', text: 'text-indigo-400', border: 'border-indigo-500/30', hover: 'hover:border-indigo-500/60', badge: 'bg-indigo-500/10 text-indigo-300' },
    { id: 'emerald', label: 'Vert/Émeraude', bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500/30', hover: 'hover:border-emerald-500/60', badge: 'bg-emerald-500/10 text-emerald-300' },
    { id: 'amber', label: 'Orange/Ambre', bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500/30', hover: 'hover:border-amber-500/60', badge: 'bg-amber-500/10 text-amber-300' },
    { id: 'rose', label: 'Rouge/Rose', bg: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-500/30', hover: 'hover:border-rose-500/60', badge: 'bg-rose-500/10 text-rose-300' },
  ];

  const getColorStyles = (colorId) => {
    return colors.find(c => c.id === colorId) || colors[0];
  };

  // ================= SAUVEGARDE & PERSISTANCE (LOCALSTORAGE) =================
  useEffect(() => {
    const now = new Date();
    setTodayDate(now);
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    const savedCourses = localStorage.getItem('student_dash_courses');
    const savedTodos = localStorage.getItem('student_dash_todos');

    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses([
        { id: 1, name: 'Mathématiques', day: 'Lundi', start: '08:30', end: '10:00', room: 'Salle 101', repeat: 'Chaque semaine', color: 'indigo', createdDate: '2026-05-11', exceptDates: [] },
        { id: 2, name: 'Histoire-Géo', day: 'Mardi', start: '10:15', end: '12:15', room: 'Amphi B', repeat: 'Une seule fois', color: 'amber', specificDate: '2026-05-26', createdDate: '2026-05-26', exceptDates: [] },
        { id: 3, name: 'Informatique', day: 'Jeudi', start: '14:00', end: '16:00', room: 'Labo Info', repeat: 'Chaque semaine', color: 'emerald', createdDate: '2026-05-11', exceptDates: [] },
      ]);
    }

    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      setTodos([
        { id: 1, text: 'Rendre le DM de maths', completed: false, dueDate: '2026-05-25' },
        { id: 2, text: 'Préparer la soutenance d\'info', completed: false, dueDate: '2026-05-28' },
      ]);
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('student_dash_courses', JSON.stringify(courses));
    }
  }, [courses, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('student_dash_todos', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // --- TRAITEMENT DU TRI DES HORAIRES ---
  const getSortableTime = (timeString) => {
    if (!timeString) return 0;
    const parts = timeString.toLowerCase().split(/[h:.,\s]+/);
    const hoursPart = parts[0] ? parts[0].replace(/[^0-9]/g, '') : '';
    const minutesPart = parts[1] ? parts[1].replace(/[^0-9]/g, '') : '';
    let hours = parseInt(hoursPart, 10) || 0;
    let minutes = parseInt(minutesPart, 10) || 0;
    
    if (parts.length === 1 && hoursPart.length >= 3) {
      hours = parseInt(hoursPart.substring(0, hoursPart.length - 2), 10) || 0;
      minutes = parseInt(hoursPart.substring(hoursPart.length - 2), 10) || 0;
    }
    return (hours * 60) + minutes;
  };

  // --- MOTEUR DE RÉCURRENCE INTELLIGENT ---
  const shouldShowCourseOnDate = (course, targetDateObj) => {
    const targetISO = targetDateObj.toLocaleDateString('fr-CA');
    
    if (course.exceptDates && course.exceptDates.includes(targetISO)) {
      return false;
    }

    if (course.repeat === 'Une seule fois') {
      return course.specificDate === targetISO;
    }

    const dayName = daysOfWeek[(targetDateObj.getDay() + 6) % 7];
    if (course.day !== dayName) return false;

    const start = new Date(course.createdDate || targetISO);
    start.setHours(0,0,0,0);
    const target = new Date(targetDateObj);
    target.setHours(0,0,0,0);

    if (target < start) return false;
    if (course.repeat === 'Chaque semaine') return true;

    if (course.repeat === 'Toutes les 2 semaines') {
      const diffTime = Math.abs(target - start);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      return diffWeeks % 2 === 0;
    }

    if (course.repeat === 'Chaque mois') {
      return start.getDate() === target.getDate() || (target.getMonth() - start.getMonth() + (12 * (target.getFullYear() - start.getFullYear()))) >= 0;
    }

    return false;
  };

  // --- NAVIGATION CALENDRIER ---
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = getStartOfWeek(currentDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const startOfWeekLabel = weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const endOfWeekLabel = weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  // --- NOTIFICATIONS ---
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const sendTestNotification = () => {
    if (notifPermission !== 'granted') return;
    new Notification('StudentDash 📅', { body: 'Ça fonctionne niquel ! Vos cours sont synchronisés.' });
  };

  // --- GESTION COURS ---
  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.start || !newCourse.end) return;

    const dayIndex = daysOfWeek.indexOf(newCourse.day);
    const targetDateForCourse = weekDays[dayIndex];
    const specificDate = targetDateForCourse.toLocaleDateString('fr-CA');

    setCourses([...courses, { 
      ...newCourse, 
      id: Date.now(), 
      specificDate: newCourse.repeat === 'Une seule fois' ? specificDate : null,
      createdDate: specificDate,
      exceptDates: []
    }]);
    
    setNewCourse({ name: '', day: 'Lundi', start: '', end: '', room: '', repeat: 'Chaque semaine', color: 'indigo' });
  };

  const handleDeleteCourseClick = (course, currentOccurrenceDateISO) => {
    if (course.repeat === 'Une seule fois') {
      setCourses(courses.filter(c => c.id !== course.id));
      return;
    }

    const choice = window.confirm(
      `Options de suppression pour "${course.name}" :\n\n` +
      `👉 Cliquez sur [ OK ] pour annuler ce cours UNIQUEMENT le ${new Date(currentOccurrenceDateISO).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.\n` +
      `👉 Cliquez sur [ Annuler ] pour le supprimer DÉFINITIVEMENT de tout votre calendrier.`
    );

    if (choice) {
      setCourses(courses.map(c => {
        if (c.id === course.id) {
          const currentExceptions = c.exceptDates || [];
          return { ...c, exceptDates: [...currentExceptions, currentOccurrenceDateISO] };
        }
        return c;
      }));
    } else {
      if (window.confirm(`Confirmer la suppression complète de la série "${course.name}" ?`)) {
        setCourses(courses.filter(c => c.id !== course.id));
      }
    }
  };

  // --- GESTION TO-DO ---
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodo.text) return;
    setTodos([...todos, { ...newTodo, id: Date.now(), completed: false }]);
    setNewTodo({ text: '', dueDate: todayDate.toLocaleDateString('fr-CA') });
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // --- FILTRES ACCUEIL ---
  const todayISO = todayDate.toLocaleDateString('fr-CA');
  const todayCourses = courses
    .filter(c => shouldShowCourseOnDate(c, todayDate))
    .sort((a, b) => getSortableTime(a.start) - getSortableTime(b.start));

  const todayTodos = todos.filter(t => t.dueDate === todayISO && !t.completed);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-24 md:pb-8">
      
      {/* --- BARRE DE NAVIGATION (TOP SUR PC, CACHÉE/ADAPTÉE SUR MOBILE) --- */}
      <nav className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold text-xl">S</div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              StudentDash
            </span>
          </div>
          
          {/* Menu de navigation : visible uniquement sur PC (sm et +) */}
          <div className="hidden sm:flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700/50">
            <button onClick={() => setActiveTab('home')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Home size={16} /> <span>Aujourd'hui</span>
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Calendar size={16} /> <span>Emploi du Temps</span>
            </button>
            <button onClick={() => setActiveTab('todo')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'todo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <CheckSquare size={16} /> <span>To-Do Liste</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- CONTENU --- */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* NOTIFICATIONS */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {notifPermission === 'granted' ? (
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 shrink-0"><Bell size={20} /></div>
            ) : (
              <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400 shrink-0"><BellOff size={20} /></div>
            )}
            <div>
              <p className="text-sm font-semibold">Notifications système</p>
              <p className="text-xs text-slate-400">
                {notifPermission === 'granted' ? 'Alertes activées sur cet appareil.' : 'Activez les alertes pour vos rappels de cours.'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
            {notifPermission !== 'granted' && (
              <button onClick={requestNotificationPermission} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors text-center">
                Autoriser
              </button>
            )}
            <button onClick={sendTestNotification} className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-600 text-center">
              Tester un push
            </button>
          </div>
        </div>

        {/* ACCUEIL */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800 rounded-2xl p-5 sm:p-6 border border-indigo-500/20 shadow-xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Au programme aujourd'hui 📅</h1>
              <p className="text-sm text-slate-400">Nous sommes le <span className="capitalize font-bold text-slate-200">{todayDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cours */}
              <div className="bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-700 shadow-md">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-indigo-400 mb-4"><BookOpen size={20}/> Cours du jour ({todayCourses.length})</h2>
                {todayCourses.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/40 rounded-lg border border-dashed border-slate-700 text-slate-500 text-sm">
                    Aucun cours de prévu aujourd'hui ! 🙌
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayCourses.map(course => {
                      const style = getColorStyles(course.color);
                      return (
                        <div key={course.id} className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/40 flex justify-between items-center group">
                          <div className="min-w-0 flex-1">
                            <p className={`font-semibold text-sm sm:text-base truncate ${style.text}`}>{course.name}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock size={12}/> {course.start} - {course.end}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className={`text-[11px] sm:text-xs px-2 py-1 rounded border ${style.badge} border-slate-700 whitespace-nowrap`}>{course.room || 'N/A'}</span>
                            <button onClick={() => handleDeleteCourseClick(course, todayISO)} className="text-slate-500 hover:text-rose-400 p-1 sm:opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* To-Do */}
              <div className="bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-700 shadow-md">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-emerald-400 mb-4"><CheckSquare size={20}/> À faire aujourd'hui ({todayTodos.length})</h2>
                {todayTodos.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/40 rounded-lg border border-dashed border-slate-700 text-emerald-400 text-sm font-medium">
                    🎉 Rien à faire pour aujourd'hui !
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTodos.map(todo => (
                      <div key={todo.id} className="flex items-center justify-between bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/40 gap-2">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <button onClick={() => toggleTodo(todo.id)} className="w-5 h-5 rounded-md border border-slate-600 flex items-center justify-center bg-slate-900 hover:border-emerald-500 shrink-0">
                            <Check size={12} className="text-transparent" />
                          </button>
                          <span className="text-sm text-slate-200 truncate">{todo.text}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 whitespace-nowrap">Aujourd'hui</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CALENDRIER */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex flex-row justify-between items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700 gap-2 shadow-lg">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm sm:text-base md:text-lg min-w-0">
                <CalendarDays size={20} className="shrink-0" />
                <span className="truncate">Du {startOfWeekLabel} au {endOfWeekLabel}</span>
              </div>
              <div className="flex space-x-1 sm:space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-700/60 shrink-0">
                <button onClick={handlePrevWeek} className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-md"><ChevronLeft size={16} /></button>
                <button onClick={handleGoToToday} className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-slate-200 bg-slate-800 rounded-md">Auj.</button>
                <button onClick={handleNextWeek} className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-md"><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* Ajouter de cours */}
            <form onSubmit={handleAddCourse} className="bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-700 shadow-md space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nom du cours</label>
                  <input type="text" required placeholder="Ex: Algorithmique..." value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Jour</label>
                  <select value={newCourse.day} onChange={e => setNewCourse({...newCourse, day: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                    {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Début</label>
                  <input type="text" required placeholder="Ex: 08:30" value={newCourse.start} onChange={e => setNewCourse({...newCourse, start: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fin</label>
                  <input type="text" required placeholder="Ex: 10:00" value={newCourse.end} onChange={e => setNewCourse({...newCourse, end: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-end pt-2 border-t border-slate-700/50">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Récurrence</label>
                  <select value={newCourse.repeat} onChange={e => setNewCourse({...newCourse, repeat: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                    <option value="Chaque semaine">Chaque semaine</option>
                    <option value="Toutes les 2 semaines">Toutes les 2 semaines</option>
                    <option value="Chaque mois">Chaque mois</option>
                    <option value="Une seule fois">Une seule fois</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Couleur</label>
                  <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700 justify-around">
                    {colors.map(c => (
                      <button type="button" key={c.id} onClick={() => setNewCourse({...newCourse, color: c.id})} className={`w-6 h-6 rounded-full ${c.bg} ${newCourse.color === c.id ? 'ring-2 ring-white scale-110' : 'opacity-60'} transition-all`} />
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2 md:col-span-1 lg:col-span-2 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Salle (Optionnel)</label>
                    <input type="text" placeholder="Salle" value={newCourse.room} onChange={e => setNewCourse({...newCourse, room: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 rounded-lg text-sm flex items-center justify-center gap-2 h-[38px] shrink-0 transition-all self-end mt-2 sm:mt-0">
                    <Plus size={18} /> Ajouter
                  </button>
                </div>
              </div>
            </form>

            {/* Semainier (Responsive : en colonne sur mobile, en grille sur PC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {weekDays.map((dateObj, idx) => {
                const dayName = daysOfWeek[idx];
                const dateISO = dateObj.toLocaleDateString('fr-CA');
                const isCurrentToday = dateISO === todayISO;
                const dayCourses = courses.filter(c => shouldShowCourseOnDate(c, dateObj)).sort((a, b) => getSortableTime(a.start) - getSortableTime(b.start));

                return (
                  <div key={dayName} className={`bg-slate-800 rounded-xl border p-4 flex flex-col min-h-[220px] sm:min-h-[340px] ${isCurrentToday ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-700'}`}>
                    <div className={`text-center py-1.5 rounded mb-3 ${isCurrentToday ? 'bg-indigo-600 text-white' : 'bg-slate-900/40'}`}>
                      <p className="text-xs uppercase font-extrabold tracking-wider">{dayName} {isCurrentToday && '🎯'}</p>
                      <p className="text-sm font-bold text-slate-300">{dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {dayCourses.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center pt-4 sm:pt-8 italic">Pas de cours</p>
                      ) : (
                        dayCourses.map(course => {
                          const style = getColorStyles(course.color);
                          return (
                            <div key={course.id} className="group relative bg-slate-900/80 border border-slate-700/40 rounded-lg p-3">
                              <button onClick={() => handleDeleteCourseClick(course, dateISO)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={14} />
                              </button>
                              <p className={`text-sm font-semibold ${style.text} pr-4 truncate`}>{course.name}</p>
                              <div className="flex items-center text-xs text-slate-400 mt-1.5 gap-1">
                                <Clock size={12} /> <span>{course.start} - {course.end}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {course.room && <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{course.room}</span>}
                                {course.repeat !== 'Une seule fois' && (
                                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <RefreshCw size={8}/> {course.repeat.replace('Chaque ', '')}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TO-DO LISTE */}
        {activeTab === 'todo' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <form onSubmit={handleAddTodo} className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700 shadow-md flex flex-col sm:flex-row gap-3">
              <input type="text" required placeholder="Ajouter une tâche importante..." value={newTodo.text} onChange={e => setNewTodo({...newTodo, text: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
              <div className="flex gap-2 w-full sm:w-auto">
                <input type="date" value={newTodo.dueDate} onChange={e => setNewTodo({...newTodo, dueDate: e.target.value})} className="flex-1 sm:flex-none bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1 shrink-0">
                  <Plus size={16} /> Ajouter
                </button>
              </div>
            </form>

            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-md overflow-hidden">
              <div className="p-4 bg-slate-700/30 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-sm sm:text-base text-slate-200">Liste globale des tâches</h3>
                <span className="text-xs font-semibold bg-slate-900 text-slate-400 px-2.5 py-1 rounded-full">
                  {todos.filter(t => !t.completed).length} restantes
                </span>
              </div>

              <div className="divide-y divide-slate-700/60">
                {todos.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 text-sm">Aucune tâche enregistrée.</p>
                ) : (
                  todos.map(todo => (
                    <div key={todo.id} className="p-4 flex items-center justify-between hover:bg-slate-700/10 transition-colors gap-2">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button onClick={() => toggleTodo(todo.id)} className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${todo.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 bg-slate-900'}`}>
                          {todo.completed && <Check size={12} />}
                        </button>
                        <span className={`text-sm truncate ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{todo.text}</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 ml-2 shrink-0">
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                          {new Date(todo.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                        <button onClick={() => handleDeleteTodo(todo.id)} className="text-slate-500 hover:text-rose-400 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- BARRE DE NAVIGATION BASSE (MOBILE PORTRAIT ONLY) --- */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-md border-t border-slate-700 px-2 py-2 flex justify-around shadow-xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg transition-all ${activeTab === 'home' ? 'text-indigo-400 bg-slate-900/50' : 'text-slate-400'}`}>
          <Home size={20} />
          <span className="text-[10px] mt-1 font-medium">Aujourd'hui</span>
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg transition-all ${activeTab === 'calendar' ? 'text-indigo-400 bg-slate-900/50' : 'text-slate-400'}`}>
          <Calendar size={20} />
          <span className="text-[10px] mt-1 font-medium">Calendrier</span>
        </button>
        <button onClick={() => setActiveTab('todo')} className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg transition-all ${activeTab === 'todo' ? 'text-indigo-400 bg-slate-900/50' : 'text-slate-400'}`}>
          <CheckSquare size={20} />
          <span className="text-[10px] mt-1 font-medium">To-Do</span>
        </button>
      </div>

    </div>
  );
}