'use client';

import { createContext, useContext, useReducer } from 'react';

const ResumeContext = createContext(null);
const ResumeDispatchContext = createContext(null);

// Safe UUID helper for both Client and Server (SSR)
const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for SSR or older browsers
  return Math.random().toString(36).substring(2, 11);
};

const createInitialState = (isClient = false) => {
  // Use stable IDs for SSR to prevent hydration mismatch
  const getStableId = (prefix) => isClient ? generateId() : `${prefix}-initial-0`;

  return {
    track: null,
    activeTemplate: 'bold-neo',
    theme: { color: '#00B8A9', font: 'Inter' },
    is_public: false,
    slug: '',
    language: 'en',
    layoutOrder: ['executiveSummary', 'workExperience', 'education', 'skills', 'academicProjects', 'certifications'],
    onboardingComplete: false,
    importedFieldsHighlight: false, // New flag for glowing animation on import
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
      { id: getStableId('edu'), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', cgpa: '', description: '' }
    ],
    skills: [
      { id: getStableId('skill'), name: '', level: 'intermediate' }
    ],
    workExperience: [
      { id: getStableId('work'), company: '', title: '', startDate: '', endDate: '', current: false, description: '' }
    ],
    internships: [
      { id: getStableId('intern'), company: '', role: '', startDate: '', endDate: '', description: '' }
    ],
    academicProjects: [
      { id: getStableId('proj'), name: '', technologies: '', link: '', description: '' }
    ],
    certifications: [
      { id: getStableId('cert'), name: '', issuer: '', date: '', link: '' }
    ],
    clientProjects: [
      { id: getStableId('client'), client: '', role: '', duration: '', description: '', link: '' }
    ],
    researchPapers: [
      { id: getStableId('paper'), title: '', publication: '', date: '', link: '', abstract: '' }
    ],
    portfolio: [
      { id: getStableId('port'), title: '', image: null, link: '', description: '' }
    ],
    customSections: [],
  };
};

// This initialState is used for SSR and initial client hydration
const initialState = createInitialState(false);

function resumeReducer(state, action) {
  switch (action.type) {
    case 'SET_TRACK':
      return { ...state, track: action.payload, onboardingComplete: true };

    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingComplete: true };

    case 'SET_IMPORTED_HIGHLIGHT':
      return { ...state, importedFieldsHighlight: action.payload };

    case 'SET_TEMPLATE':
      return { ...state, activeTemplate: action.payload };

    case 'UPDATE_THEME':
      return { ...state, theme: { ...state.theme, ...action.payload } };

    case 'TOGGLE_PUBLIC':
      return { ...state, is_public: !state.is_public };

    case 'UPDATE_SLUG':
      return { ...state, slug: action.payload };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

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
        [section]: [...state[section], { id: generateId(), ...item }],
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
            id: generateId(),
            title: action.payload?.title || 'Custom Section',
            items: [{ id: generateId(), content: '' }],
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
            ? { ...s, items: [...s.items, { id: generateId(), content: '' }] }
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

    case 'LOAD_RESUME': {
      const payload = action.payload;
      // Ensure executiveSummary is in layoutOrder if missing (migration)
      if (payload.layoutOrder && Array.isArray(payload.layoutOrder) && !payload.layoutOrder.includes('executiveSummary')) {
        payload.layoutOrder = ['executiveSummary', ...payload.layoutOrder];
      }
      return { ...state, ...payload };
    }

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

export function ResumeProvider({ children, initialData = null }) {
  const [state, dispatch] = useReducer(resumeReducer, initialData || initialState);

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
