'use client';

import { useEffect, useState } from 'react';
import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import PersonalInfo from './PersonalInfo';
import Education from './Education';
import Skills from './Skills';
import WorkExperience from './WorkExperience';
import Internships from './Internships';
import AcademicProjects from './AcademicProjects';
import ExecutiveSummary from './ExecutiveSummary';
import Certifications from './Certifications';
import CustomSection from './CustomSection';
import ClientProjects from './ClientProjects';
import ResearchPapers from './ResearchPapers';
import Portfolio from './Portfolio';
import styles from './DraggableList.module.css';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SECTION_COMPONENTS = {
  personalInfo: { component: PersonalInfo, label: 'Personal Details', isSortable: false },
  executiveSummary: { component: ExecutiveSummary, label: 'Executive Summary', isSortable: true },
  workExperience: { component: WorkExperience, label: 'Work Experience', isSortable: true },
  education: { component: Education, label: 'Education', isSortable: true },
  skills: { component: Skills, label: 'Skills', isSortable: true },
  internships: { component: Internships, label: 'Internships', isSortable: true },
  academicProjects: { component: AcademicProjects, label: 'Academic Projects', isSortable: true },
  certifications: { component: Certifications, label: 'Certifications', isSortable: true },
  clientProjects: { component: ClientProjects, label: 'Client Projects', isSortable: true },
  researchPapers: { component: ResearchPapers, label: 'Research Papers', isSortable: true },
  portfolio: { component: Portfolio, label: 'Portfolio', isSortable: true },
  customSections: { component: CustomSection, label: 'Custom Sections', isSortable: true },
};

const TRACK_DEFAULTS = {
  fresher: ['personalInfo', 'education', 'skills', 'internships', 'academicProjects', 'certifications', 'customSections'],
  professional: ['personalInfo', 'executiveSummary', 'workExperience', 'education', 'skills', 'academicProjects', 'certifications', 'customSections'],
  freelancer: ['personalInfo', 'executiveSummary', 'clientProjects', 'portfolio', 'skills', 'education', 'certifications', 'customSections'],
  academic: ['personalInfo', 'executiveSummary', 'researchPapers', 'education', 'workExperience', 'skills', 'certifications', 'customSections'],
  designer: ['personalInfo', 'portfolio', 'workExperience', 'education', 'skills', 'certifications', 'customSections'],
  'career-switcher': ['personalInfo', 'executiveSummary', 'workExperience', 'academicProjects', 'skills', 'education', 'certifications', 'customSections'],
};

function SortableItem({ id, children, label, isSortable, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: !isSortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    marginBottom: 'var(--cr-space-xl)',
    animationDelay: `${index * 0.1}s`
  };

  return (
    <div ref={setNodeRef} style={style} className="reveal-entry">
      {isSortable && (
        <div className={styles.dragHandleContainer}>
           <div className={styles.sectionDivider}>
            <span className={styles.sectionDividerText}>{label}</span>
          </div>
          <button {...attributes} {...listeners} className={styles.dragHandle}>
            ⋮⋮
          </button>
        </div>
      )}
      {!isSortable && (
         <div className={styles.sectionDivider}>
          <span className={styles.sectionDividerText}>{label}</span>
        </div>
      )}
      <div className={styles.sortableContent}>
        {children}
      </div>
    </div>
  );
}

export default function DraggableSectionList() {
  const { track, layoutOrder } = useResume();
  const dispatch = useResumeDispatch();
  const [activeItems, setActiveItems] = useState([]);

  useEffect(() => {
    // If layoutOrder is empty, or the track changed and we want to enforce defaults (optional)
    // For now, let's just initialize if it's empty.
    if (!layoutOrder || layoutOrder.length === 0) {
      dispatch({ type: 'SET_LAYOUT_ORDER', payload: TRACK_DEFAULTS[track] || TRACK_DEFAULTS['fresher'] });
    }
  }, [track, layoutOrder, dispatch]);

  useEffect(() => {
    // We update local state when context layout stringifies over
    if (layoutOrder && layoutOrder.length > 0) {
      const currentDefaults = TRACK_DEFAULTS[track] || TRACK_DEFAULTS['fresher'];
      
      // Filter out invalid ones, and add any missing ones from default for safety
      let merged = layoutOrder.filter(id => currentDefaults.includes(id));
      currentDefaults.forEach(id => {
        if (!merged.includes(id)) merged.push(id);
      });
      setActiveItems(merged);
    }
  }, [layoutOrder, track]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = activeItems.indexOf(active.id);
      const newIndex = activeItems.indexOf(over.id);
      
      const newOrder = arrayMove(activeItems, oldIndex, newIndex);
      setActiveItems(newOrder);
      dispatch({ type: 'SET_LAYOUT_ORDER', payload: newOrder });
    }
  };

  if (!activeItems.length) return null;

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={activeItems}
        strategy={verticalListSortingStrategy}
      >
        {activeItems.map((id, index) => {
          const config = SECTION_COMPONENTS[id];
          if (!config) return null;
          const ComponentToRender = config.component;
          
          return (
            <SortableItem key={id} id={id} label={config.label} isSortable={config.isSortable} index={index}>
              <ComponentToRender />
            </SortableItem>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}
