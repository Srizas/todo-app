'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Home, Plus, Trash2, Clock, BookOpen, Check, RefreshCw, Bell, BellOff, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export default function App() {
  // --- ÉTATS PRINCIPAUX ---
  const [activeTab, setActiveTab] = useState('home');
  const [notifPermission, setNotifPermission] = useState('default');
  
  // NAVIGATION DE SEMAINES : Gère la date pivot de l'application
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate, setTodayDate] = useState(new Date());

  // États des données (chargés depuis le localStorage)
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

  // ================= EFFETS INITIALISATION & LOCALSTORAGE =================
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

  // Sauvegarder automatiquement dès qu'un élément change
  useEffect(() => {
    if (isLoaded) localStorage.setItem('student_dash_courses', JSON.stringify(courses));
  }, [courses, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('student_dash_todos', JSON.stringify(todos));
  }, [todos, isLoaded]);

  // --- MOTEUR DE TRI DES HORAIRES COMPLET ---
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

  // --- MOTEUR DE RÉCURRENCE FILTRÉ ---
  const shouldShowCourseOnDate = (course, targetDateObj) => {
    const targetISO = targetDateObj.toLocaleDateString('fr-CA');
    if (course.exceptDates && course.exceptDates.includes(targetISO)) return false;
    if (course.repeat === 'Une seule fois') return course.specificDate === targetISO;
    const dayName = daysOfWeek[(targetDateObj.getDay() + 6) % 7];
    if (course.day !== dayName) return false;
    const start = new Date(course.createdDate || targetISO);
    start.setHours(0,0,0,0);
    const target = new Date(targetDateObj);
    target.setHours(0,0,0,0);
    if (target < start) return false;
    if (course.repeat === 'Chaque semaine') return true;
    return false;
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const handlePrevWeek = () => { const newDate = new Date(currentDate); newDate.setDate(newDate.getDate() - 7); setCurrentDate(newDate); };
  const handleNextWeek = () => { const newDate = new Date(currentDate); newDate.setDate(newDate.getDate() + 7); setCurrentDate(newDate); };
  const handleGoToToday = () => { setCurrentDate(new Date()); };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = getStartOfWeek(currentDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const startOfWeekLabel = weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const endOfWeekLabel = weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const requestNotificationPermission = async () => { if (!('Notification' in window)) return; const permission = await Notification.requestPermission(); setNotifPermission(permission); };
  const sendTestNotification = () => { if (notifPermission !== 'granted') return; new Notification('StudentDash 📅', { body: 'Ça fonctionne !' }); };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.start || !newCourse.end) return;
    const dayIndex = daysOfWeek.indexOf(newCourse.day);
    const targetDateForCourse = weekDays[dayIndex];
    const specificDate = targetDateForCourse.toLocaleDateString('fr-CA');
    setCourses([...courses, { ...newCourse, id: Date.now(), specificDate: newCourse.repeat === 'Une seule fois' ? specificDate : null, createdDate: specificDate, exceptDates: [] }]);
    setNewCourse({ name: '', day: 'Lundi', start: '', end: '', room: '', repeat: 'Chaque semaine', color: 'indigo' });
  };

  const handleDeleteCourseClick = (course, currentOccurrenceDateISO) => {
    if (course.repeat === 'Une seule fois') { setCourses(courses.filter(c => c.id !== course.id)); return; }
    const choice = window.confirm("OK pour supprimer cette occurrence, Annuler pour tout supprimer.");
    if (choice) { setCourses(courses.map(c => c.id === course.id ? { ...c, exceptDates: [...(c.exceptDates || []), currentOccurrenceDateISO] } : c)); } 
    else { setCourses(courses.filter(c => c.id !== course.id)); }
  };

  const handleAddTodo = (e) => { e.preventDefault(); if (!newTodo.text) return; setTodos([...todos, { ...newTodo, id: Date.now(), completed: false }]); setNewTodo({ text: '', dueDate: todayDate.toLocaleDateString('fr-CA') }); };
  const toggleTodo = (id) => { setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)); };
  const handleDeleteTodo = (id) => { setTodos(todos.filter(todo => todo.id !== id)); };

  const todayISO = todayDate.toLocaleDateString('fr-CA');
  const todayCourses = courses.filter(c => shouldShowCourseOnDate(c, todayDate)).sort((a, b) => getSortableTime(a.start) - getSortableTime(b.start));
  const todayTodos = todos.filter(t => t.dueDate === todayISO && !t.completed);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Ton JSX ici reste identique, les fonctions de sauvegarde sont déjà actives */}
      <h1 className="text-white text-2xl font-bold">StudentDash est prêt.</h1>
      {/* ... le reste de ton code original ... */}
    </div>
  );
}