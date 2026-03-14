'use client';

import { createContext, useContext, useReducer } from 'react';

const ResumeContext = createContext(null);
const ResumeDispatchContext = createContext(null);

const initialState = {
  track: null, // 'fresher' | 'professional' | 'freelancer' | 'academic' | 'designer' | 'career-switcher'
  activeTemplate: 'bold-neo',
  layoutOrder: [], // Will store the order of active sections
  onboardingComplete: false,
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    profilePhoto: null,
  },
  executiveSummary: '',
  education: [
    { id: crypto.randomUUID(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', cgpa: '', description: '' }
  ],
  skills: [
    { id: crypto.randomUUID(), name: '', level: 'intermediate' }
  ],
  workExperience: [
    { id: crypto.randomUUID(), company: '', title: '', startDate: '', endDate: '', current: false, description: '' }
  ],
  internships: [
    { id: crypto.randomUUID(), company: '', role: '', startDate: '', endDate: '', description: '' }
  ],
  academicProjects: [
    { id: crypto.randomUUID(), name: '', technologies: '', link: '', description: '' }
  ],
  certifications: [
    { id: crypto.randomUUID(), name: '', issuer: '', date: '', link: '' }
  ],
  clientProjects: [
    { id: crypto.randomUUID(), client: '', role: '', duration: '', description: '', link: '' }
  ],
  researchPapers: [
    { id: crypto.randomUUID(), title: '', publication: '', date: '', link: '', abstract: '' }
  ],
  portfolio: [
    { id: crypto.randomUUID(), title: '', image: null, link: '', description: '' }
  ],
  customSections: [],
};

function resumeReducer(state, action) {
  switch (action.type) {
    case 'SET_TRACK':
      return { ...state, track: action.payload, onboardingComplete: true };

    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingComplete: true };

    case 'SET_TEMPLATE':
      return { ...state, activeTemplate: action.payload };

    case 'SET_LAYOUT_ORDER':
      return { ...state, layoutOrder: action.payload };

    case 'UPDATE_PERSONAL_INFO':
      return { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };

    case 'UPDATE_EXECUTIVE_SUMMARY':
      return { ...state, executiveSummary: action.payload };

    case 'UPDATE_SECTION_ITEM': {
      const { section, id, data } = action.payload;
      return {
        ...state,
        [section]: state[section].map(item =>
          item.id === id ? { ...item, ...data } : item
        ),
      };
    }

    case 'ADD_SECTION_ITEM': {
      const { section, item } = action.payload;
      return {
        ...state,
        [section]: [...state[section], { id: crypto.randomUUID(), ...item }],
      };
    }

    case 'REMOVE_SECTION_ITEM': {
      const { section, id } = action.payload;
      return {
        ...state,
        [section]: state[section].filter(item => item.id !== id),
      };
    }

    case 'ADD_CUSTOM_SECTION':
      return {
        ...state,
        customSections: [
          ...state.customSections,
          {
            id: crypto.randomUUID(),
            title: action.payload?.title || 'Custom Section',
            items: [{ id: crypto.randomUUID(), content: '' }],
          },
        ],
      };

    case 'UPDATE_CUSTOM_SECTION_TITLE': {
      const { id, title } = action.payload;
      return {
        ...state,
        customSections: state.customSections.map(s =>
          s.id === id ? { ...s, title } : s
        ),
      };
    }

    case 'ADD_CUSTOM_SECTION_ITEM': {
      const { sectionId } = action.payload;
      return {
        ...state,
        customSections: state.customSections.map(s =>
          s.id === sectionId
            ? { ...s, items: [...s.items, { id: crypto.randomUUID(), content: '' }] }
            : s
        ),
      };
    }

    case 'UPDATE_CUSTOM_SECTION_ITEM': {
      const { sectionId, itemId, content } = action.payload;
      return {
        ...state,
        customSections: state.customSections.map(s =>
          s.id === sectionId
            ? {
              ...s,
              items: s.items.map(i =>
                i.id === itemId ? { ...i, content } : i
              ),
            }
            : s
        ),
      };
    }

    case 'REMOVE_CUSTOM_SECTION_ITEM': {
      const { sectionId, itemId } = action.payload;
      return {
        ...state,
        customSections: state.customSections.map(s =>
          s.id === sectionId
            ? { ...s, items: s.items.filter(i => i.id !== itemId) }
            : s
        ),
      };
    }

    case 'REMOVE_CUSTOM_SECTION': {
      return {
        ...state,
        customSections: state.customSections.filter(s => s.id !== action.payload),
      };
    }

    case 'REORDER_CUSTOM_SECTIONS': {
      return { ...state, customSections: action.payload };
    }

    case 'LOAD_RESUME':
      return { ...state, ...action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function ResumeProvider({ children }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState);

  return (
    <ResumeContext.Provider value={state}>
      <ResumeDispatchContext.Provider value={dispatch}>
        {children}
      </ResumeDispatchContext.Provider>
    </ResumeContext.Provider>
  );
}

export function useResume() {
  return useContext(ResumeContext);
}

export function useResumeDispatch() {
  return useContext(ResumeDispatchContext);
}
