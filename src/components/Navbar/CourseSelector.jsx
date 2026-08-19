import { useState, useRef, useEffect } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { AVAILABLE_COURSES } from '../../data/index';
import { summarizeCourses } from '../../utils/courseProgress';
import { getCurrentLevel } from '../../utils/levelSystem';
import './CourseSelector.css';

const CURSO_IDS = AVAILABLE_COURSES.map(c => c.id);

// Rótulo curto do estado de cada curso, mostrado ANTES da troca.
// Sem isto, trocar de idioma é uma aposta às cegas: a pessoa não sabe se vai
// cair num curso zerado ou reencontrar o progresso que já tinha.
const rotuloDoCurso = (courseId, resumo) => {
  const info = resumo[courseId];
  if (!info || !info.started) return 'Novo';
  const nivel = getCurrentLevel(info.wordsStudied, courseId).level;
  return `Nível ${nivel}`;
};

const CourseSelector = ({ variant = 'dropdown' }) => {
  const { progress, setActiveCourse, isSwitchingCourse } = useProgress();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeCourseId = progress?.activeCourse || 'en-pt';
  const currentCourse = AVAILABLE_COURSES.find(c => c.id === activeCourseId) || AVAILABLE_COURSES[0];
  const resumo = summarizeCourses(progress, CURSO_IDS);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (courseId) => {
    // A troca é assíncrona: grava o curso que sai no servidor antes de trocar
    // (ver setActiveCourse em useProgress). O dropdown fecha na hora, mas o
    // botão continua mostrando o estado de carregamento.
    setActiveCourse(courseId);
    setIsOpen(false);
  };

  if (variant === 'settings') {
    return (
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          {AVAILABLE_COURSES.map((course) => {
            const isActive = course.id === activeCourseId;
            const isAvailable = course.available !== false;

            return (
              <button
                key={course.id}
                type="button"
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => isAvailable && handleSelect(course.id)}
                disabled={!isAvailable || isSwitchingCourse}
                aria-pressed={isActive}
                title={!isAvailable ? 'Bloqueado por enquanto' : `Usar ${course.name}`}
                style={!isAvailable ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
              >
                {course.flag} {course.name}
                <span style={{ opacity: 0.75, marginLeft: 6, fontSize: 'var(--fs-xs)' }}>
                  · {rotuloDoCurso(course.id, resumo)}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--space-sm)' }}>
          {isSwitchingCourse
            ? '⏳ Salvando seu progresso e carregando o outro idioma…'
            : 'Cada idioma guarda o próprio progresso. Trocar não apaga nada — você volta no nível em que parou.'}
        </p>
      </div>
    );
  }

  return (
    <div className="course-selector-container" ref={dropdownRef}>
      <button
        className="course-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitchingCourse}
        aria-label={`Curso ativo: ${currentCourse.name}`}
        title="Alternar Idioma do Curso"
      >
        <span className="course-flag">{currentCourse.flag}</span>
        <span className="course-name">{isSwitchingCourse ? 'Trocando…' : currentCourse.name}</span>
        <span className="course-arrow">{isSwitchingCourse ? '⏳' : '▾'}</span>
      </button>

      {isOpen && (
        <div className="course-dropdown glass-card animate-fade-in">
          <div className="course-dropdown-header">Cursos Disponíveis</div>
          {AVAILABLE_COURSES.map((course) => {
            const isActive = course.id === activeCourseId;
            const isAvailable = course.available !== false;

            return (
              <button
                key={course.id}
                className={`course-option ${isActive ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                onClick={() => isAvailable && handleSelect(course.id)}
                disabled={!isAvailable}
                title={!isAvailable ? 'Em breve!' : ''}
              >
                <span className="course-flag">{course.flag}</span>
                <span className="course-label">{course.name}</span>
                <span className="course-progress-tag">{rotuloDoCurso(course.id, resumo)}</span>
                {isActive && <span className="course-check">✓</span>}
                {!isAvailable && <span className="course-lock-badge">🔒 Em breve</span>}
              </button>
            );
          })}
          <div className="course-dropdown-footer">
            Cada idioma tem o próprio progresso — trocar não apaga nada.
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSelector;
