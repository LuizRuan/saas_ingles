import { useState, useRef, useEffect } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { AVAILABLE_COURSES } from '../../data/index';
import './CourseSelector.css';

const CourseSelector = ({ variant = 'dropdown' }) => {
  const { progress, setActiveCourse } = useProgress();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeCourseId = progress?.activeCourse || 'en-pt';
  const currentCourse = AVAILABLE_COURSES.find(c => c.id === activeCourseId) || AVAILABLE_COURSES[0];

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
    setActiveCourse(courseId);
    setIsOpen(false);
  };

  if (variant === 'settings') {
    return (
      <div className="course-settings-panel">
        {AVAILABLE_COURSES.map((course) => {
          const isActive = course.id === activeCourseId;
          const isAvailable = course.available !== false;

          return (
            <button
              key={course.id}
              type="button"
              className={`course-settings-option ${isActive ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
              onClick={() => isAvailable && handleSelect(course.id)}
              disabled={!isAvailable}
              aria-pressed={isActive}
              title={!isAvailable ? 'Bloqueado por enquanto' : `Usar ${course.name}`}
            >
              <span className="course-settings-flag">{course.flag}</span>
              <span className="course-settings-copy">
                <span className="course-settings-name">{course.name}</span>
                <span className="course-settings-meta">
                  {isAvailable ? (isActive ? 'Curso ativo' : 'Disponivel') : 'Bloqueado'}
                </span>
              </span>
              {isActive && <span className="course-settings-status">Ativo</span>}
              {!isAvailable && <span className="course-settings-status locked">Bloqueado</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="course-selector-container" ref={dropdownRef}>
      <button
        className="course-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Curso ativo: ${currentCourse.name}`}
        title="Alternar Idioma do Curso"
      >
        <span className="course-flag">{currentCourse.flag}</span>
        <span className="course-name">{currentCourse.name}</span>
        <span className="course-arrow">▾</span>
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
                {isActive && <span className="course-check">✓</span>}
                {!isAvailable && <span className="course-lock-badge">🔒 Em breve</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseSelector;
