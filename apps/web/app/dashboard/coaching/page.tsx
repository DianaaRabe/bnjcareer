"use client";

import React, { useState } from "react";
import { Calendar, Users, User, Clock, MapPin, CheckCircle, Star, ChevronRight, Trophy, Target, Flame } from "lucide-react";

const WORKSHOPS = [
  { id: 1, title: "Optimiser son CV avec l'IA", type: "groupe", date: "Vendredi 11 Avr.", time: "14h00 – 15h30", location: "Visio Zoom", host: "Sarah M.", spots: 3, enrolled: false },
  { id: 2, title: "Préparer ses entretiens", type: "1v1", date: "Lundi 14 Avr.", time: "10h00 – 11h00", location: "Visio Teams", host: "Marc D.", spots: 1, enrolled: true },
  { id: 3, title: "Réseautage LinkedIn efficace", type: "groupe", date: "Mercredi 16 Avr.", time: "17h00 – 18h30", location: "Présentiel Paris", host: "Lucie P.", spots: 8, enrolled: false },
  { id: 4, title: "Négociation salariale", type: "groupe", date: "Vendredi 18 Avr.", time: "14h00 – 15h30", location: "Visio Zoom", host: "Thomas R.", spots: 5, enrolled: false },
];

const OBJECTIVES = [
  { label: "CV complété à 100%", done: false, points: 50, progress: 85 },
  { label: "5 candidatures envoyées", done: true, points: 30, progress: 100 },
  { label: "1er entretien décroché", done: false, points: 80, progress: 0 },
  { label: "Atelier suivi", done: true, points: 20, progress: 100 },
  { label: "Score matching > 75%", done: false, points: 40, progress: 55 },
];

export default function CoachingPage() {
  const [enrolled, setEnrolled] = useState<number[]>([2]);
  const totalPoints = OBJECTIVES.filter((o) => o.done).reduce((acc, o) => acc + o.points, 0);
  const maxPoints = OBJECTIVES.reduce((acc, o) => acc + o.points, 0);

  const toggle = (id: number) => {
    setEnrolled((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Accompagnement</h1>
        <p className="text-slate-500 text-sm mt-1">Ateliers, sessions coaching et suivi de vos objectifs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ateliers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              Prochains ateliers
            </h2>
            <span className="text-xs text-brand-primary font-semibold bg-brand-100 px-3 py-1 rounded-full">
              {enrolled.length} inscription(s)
            </span>
          </div>

          {WORKSHOPS.map((ws) => (
            <div key={ws.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 ${
              enrolled.includes(ws.id) ? "border-brand-light ring-2 ring-brand-primary/10" : "border-slate-100 hover:shadow-md"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      ws.type === "1v1" ? "bg-brand-100 text-brand-primary" : "bg-blue-50 text-blue-700"
                    }`}>
                      {ws.type === "1v1" ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {ws.type === "1v1" ? "Individuel" : "Groupe"}
                    </span>
                    {enrolled.includes(ws.id) && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Inscrit
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{ws.title}</h3>
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {ws.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {ws.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {ws.location}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Animé par</p>
                    <p className="text-sm font-semibold text-slate-700">{ws.host}</p>
                  </div>
                  <p className="text-xs text-slate-400">{ws.spots} place(s)</p>
                  <button
                    onClick={() => toggle(ws.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      enrolled.includes(ws.id)
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-brand-primary text-white hover:bg-brand-dark shadow-md shadow-brand-primary/20"
                    }`}
                  >
                    {enrolled.includes(ws.id) ? "Se désinscrire" : "S'inscrire"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gamification */}
        <div className="space-y-4">
          {/* Score carte */}
          <div className="bg-gradient-to-br from-brand-dark to-brand-primary rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-brand-accent" />
                <h2 className="font-bold">Score parcours</h2>
              </div>
              <span className="text-2xl font-extrabold text-brand-accent">{totalPoints}pts</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-brand-accent rounded-full transition-all duration-700"
                style={{ width: `${(totalPoints / maxPoints) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60">
              <span>Débutant</span>
              <span>{maxPoints} pts max</span>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Série active</p>
                <p className="text-xs text-slate-500">7 jours d'affilée 🔥</p>
              </div>
            </div>
          </div>

          {/* Objectifs */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-primary" />
              Mes objectifs
            </h2>
            <div className="space-y-3">
              {OBJECTIVES.map((obj) => (
                <div key={obj.label} className={`rounded-xl p-3 border ${obj.done ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {obj.done ? (
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <p className={`text-xs font-semibold ${obj.done ? "text-green-700 line-through opacity-70" : "text-slate-700"}`}>
                        {obj.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-accent">
                      <Star className="w-3 h-3" />
                      {obj.points}
                    </div>
                  </div>
                  {!obj.done && obj.progress > 0 && (
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-brand-primary rounded-full"
                        style={{ width: `${obj.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
