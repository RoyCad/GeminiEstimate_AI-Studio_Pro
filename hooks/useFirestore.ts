
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, DocumentData } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Project, UserRole } from '../types';

export const useProjects = (user: any, role: UserRole | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !role) {
        setProjects([]);
        setLoading(false);
        return;
    }

    const projectsRef = collection(firestore, 'projects');
    let q;

    if (role === UserRole.ADMIN) {
      q = query(projectsRef, orderBy('startDate', 'desc'));
    } else {
      q = query(projectsRef, where('userId', '==', user.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, role]);

  return { projects, loading };
};

export const useProject = (id: string) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const unsub = onSnapshot(doc(firestore, 'projects', id), (doc) => {
            if (doc.exists()) {
                setProject({ id: doc.id, ...doc.data() } as Project);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [id]);

    return { project, loading };
};
