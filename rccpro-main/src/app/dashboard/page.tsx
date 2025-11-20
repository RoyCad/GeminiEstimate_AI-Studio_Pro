
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Briefcase,
  Users,
  DollarSign,
  ArrowRight,
  Calculator,
  PlusCircle,
  Building2,
  Construction,
  Component,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, onSnapshot, collectionGroup } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase/provider';
import { StatCard } from '@/components/stat-card';
import { format } from 'date-fns';
import { DailyAttendance, PaymentTransaction } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StandaloneCalculator from '@/components/standalone-calculator';
import PileMaterialCalculator from '@/components/pile-material-calculator';
import PileCapMaterialCalculator from '@/components/pile-cap-material-calculator';
import ColumnMaterialCalculator from '@/components/column-material-calculator';
import BeamMaterialCalculator from '@/components/beam-material-calculator';
import GradeBeamMaterialCalculator from '@/components/grade-beam-material-calculator';
import SlabMaterialCalculator from '@/components/slab-material-calculator';
import MatFoundationMaterialCalculator from '@/components/mat-foundation-material-calculator';
import CombinedFootingMaterialCalculator from '@/components/combined-footing-material-calculator';
import ShortColumnMaterialCalculator from '@/components/short-column-material-calculator';
import RetainingWallMaterialCalculator from '@/components/retaining-wall-material-calculator';
import StaircaseMaterialCalculator from '@/components/staircase-material-calculator';
import BrickworkCalculator from '@/components/brickwork-calculator';
import CcCastingCalculator from '@/components/cc-casting-calculator';
import EarthworkCalculator from '@/components/earthwork-calculator';
import StandaloneFootingCalculator from '@/components/standalone-footing-calculator';
import { Cylinder, BoxSelect, Archive, GitMerge, SquareStack, AlignHorizontalSpaceBetween, LayoutGrid, Webhook, BrickWall, Shovel, Sparkles } from 'lucide-react';
import React from 'react';


type Project = {
    id: string;
    clientName: string;
    projectName: string;
    createdAt: { seconds: number; nanoseconds: number };
};

export default function DashboardPage() {
    const { user, loading: authLoading, sessionRole } = useAuth();
    const { firestore } = useFirebase();
    const [projects, setProjects] = useState<Project[]>([]);
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [attendances, setAttendances] = useState<DailyAttendance[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ projects: 0, laborers: 0, totalBill: 0, totalPaid: 0, balanceDue: 0 });
    const [loadingStats, setLoadingStats] = useState(true);


    useEffect(() => {
        if (authLoading || !sessionRole || !user || !firestore) return;
    
        const fetchAdminData = async () => {
            setLoadingData(true);
            try {
                const allProjectsQuery = query(collection(firestore, 'projects'), orderBy('createdAt', 'desc'));
                const allProjectsSnapshot = await getDocs(allProjectsQuery);
                const allProjectsData: Project[] = allProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                
                setProjects(allProjectsData.slice(0, 5));
    
            } catch (err: any) {
                console.error("Error fetching admin data: ", err);
                if (err.code === 'permission-denied') {
                    setError("You don't have permission to view this data.");
                } else {
                    setError("Failed to load admin data.");
                }
            } finally {
                setLoadingData(false);
            }
        };
    
        const fetchClientData = () => {
            setLoadingData(true);
            setLoadingStats(true);
    
            const projectsQuery = query(collection(firestore, 'projects'), where("userId", "==", user.uid));
    
            const unsubscribeProjects = onSnapshot(projectsQuery, (projectsSnapshot) => {
                const projectsData: Project[] = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                projectsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
                setProjects(projectsData);
    
                const projectIds = projectsData.map(p => p.id);
    
                if (projectIds.length > 0) {
                    
                    const unsubscribes: (() => void)[] = [];

                    const attendanceQuery = query(collectionGroup(firestore, 'dailyAttendances'), where('projectId', 'in', projectIds));
                    const unsubAttendances = onSnapshot(attendanceQuery, (attendanceSnapshot) => {
                         const projectAttendances: DailyAttendance[] = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyAttendance));
                         setAttendances(projectAttendances.sort((a:any, b:any) => b.date.seconds - a.date.seconds).slice(0, 5));
                    });
                    unsubscribes.push(unsubAttendances);

                    const paymentsQuery = query(collectionGroup(firestore, 'transactions'), where('projectId', 'in', projectIds));
                     const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
                        const allTransactions = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

                        const clientPayments = allTransactions
                            .filter(t => t.type === 'Payment')
                            .map(t => {
                                const project = projectsData.find(p => p.id === t.projectId);
                                return { ...t, projectName: project?.projectName || 'N/A' } as PaymentTransaction;
                            })
                            .sort((a:any, b:any) => b.date.seconds - a.date.seconds)
                            .slice(0, 5);
                        setPayments(clientPayments);
                    }, (err) => {
                        console.error("Error fetching transactions:", err);
                        setError("Failed to load transaction data.");
                    });
                    unsubscribes.push(unsubPayments);

                    setLoadingData(false);
                    setLoadingStats(false);
                    
                    return () => {
                        unsubscribes.forEach(unsub => unsub());
                    };
                } else {
                    setProjects([]);
                    setAttendances([]);
                    setPayments([]);
                    setLoadingData(false);
                    setLoadingStats(false);
                }
            }, (err) => {
                console.error("Error fetching client data: ", err);
                setError("Failed to load project data.");
                setLoadingData(false);
                setLoadingStats(false);
            });
            
            return () => unsubscribeProjects();
        };

        if (sessionRole === 'Admin') {
            fetchAdminData();
        } else if (sessionRole === 'Client') {
            fetchClientData();
        }
    }, [user, firestore, sessionRole, authLoading]);

  const isLoading = authLoading || loadingData;
  
   const formatDate = (date: any) => {
        if (!date) return 'N/A';
        if (date.seconds) { // Firestore timestamp
            return format(new Date(date.seconds * 1000), 'dd MMM, yyyy');
        }
        if (date instanceof Date) {
            return format(date, 'dd MMM, yyyy');
        }
        return 'Invalid Date';
    }

  const getWelcomeName = (): string => {
    return user?.displayName?.split(' ')[0] || 'User';
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const AdminDashboard = () => (
     <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>A list of the most recently created projects.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No projects found.</p>
                ) : (
                  <ul className="space-y-4">
                    {projects.map((project) => (
                      <li key={project.id} className="flex items-center gap-4">
                          <Avatar className='h-10 w-10'>
                            <AvatarFallback>{getInitials(project.clientName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{project.projectName}</p>
                            <p className="text-sm text-muted-foreground">{project.clientName} - Created on {formatDate(project.createdAt)}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/projects/${project.id}`}>View</Link>
                          </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
               <CardFooter className='gap-2'>
                  <Button variant="outline" className="w-full" asChild><Link href="/dashboard/projects">View All</Link></Button>
                  <Button className="w-full" asChild><Link href="/dashboard/projects/create"><PlusCircle className="h-4 w-4 mr-2" />Create Project</Link></Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Quick Estimator</CardTitle>
                        <CardDescription>Select a part to get a standalone material estimation.</CardDescription>
                    </CardHeader>
                    <CardContent className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                        <Link href="/dashboard/estimator" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-background hover:bg-muted transition-colors">
                           <Construction className="h-8 w-8 text-primary" />
                           <span className="text-sm font-semibold text-center">Foundation</span>
                        </Link>
                        <Link href="/dashboard/estimator" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-background hover:bg-muted transition-colors">
                           <Building2 className="h-8 w-8 text-primary" />
                           <span className="text-sm font-semibold text-center">Columns</span>
                        </Link>
                        <Link href="/dashboard/estimator" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-background hover:bg-muted transition-colors">
                           <Component className="h-8 w-8 text-primary" />
                           <span className="text-sm font-semibold text-center">Beams & Slabs</span>
                        </Link>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Management</CardTitle>
                    </CardHeader>
                    <CardContent className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                       <Button variant="outline" asChild><Link href="/dashboard/materials"><ClipboardCheck className="h-4 w-4 mr-2" />Materials</Link></Button>
                       <Button variant="outline" asChild><Link href="/dashboard/laborers"><Users className="h-4 w-4 mr-2" />Laborers</Link></Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
  );

  const ClientDashboard = () => (
    <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className='glass-card'>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                     <div className="text-center text-muted-foreground py-8">
                        <Skeleton className="h-8 w-full mb-4" />
                        <Skeleton className="h-8 w-full" />
                     </div>
                  ) : error ? (
                     <div className="text-center text-red-500 py-8">{error}</div>
                  ) : projects.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <Briefcase className="mx-auto h-12 w-12" />
                        <p className="mt-4 text-sm">
                          No projects assigned yet.
                        </p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                        {projects.map((project) => (
                        <li key={project.id} className="flex items-center gap-4">
                            <div className="p-2.5 rounded-full bg-muted">
                              <Briefcase className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{project.projectName}</p>
                              <p className="text-sm text-muted-foreground">{project.clientName}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/projects/${project.id}`}>View <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </li>
                        ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            <Card className='glass-card'>
                <CardHeader>
                    <CardTitle>Recent Labor Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingData ? (
                        <div className="space-y-2">
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                        </div>
                    ) : attendances.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8"><Users className="mx-auto h-12 w-12" /><p className="mt-4 text-sm">No recent attendance records.</p></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead className='text-center'>Laborers</TableHead>
                                    <TableHead className='text-right'>Total Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {attendances.map(att => (
                                    <TableRow key={att.id}>
                                        <TableCell>{formatDate(att.date)}</TableCell>
                                        <TableCell className='text-center'>{att.numberOfLaborers}</TableCell>
                                        <TableCell className='text-right font-medium'>{new Intl.NumberFormat('en-IN').format(att.numberOfLaborers * att.wagePerLaborer)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
          </div>
    </div>
  );


  return (
    <div className="space-y-6">
        {isLoading && (
             <div className="space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </div>
            </div>
        )}

        {!isLoading && (
            <div className='mb-8'>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome, {getWelcomeName()}!
            </h1>
            <p className="text-muted-foreground mt-1">
                {sessionRole === 'Admin' ? "Here's a quick overview of your projects and tools." : "Here's a quick overview of your projects on behalf of ROY Construction & Consultant."}
            </p>
            </div>
        )}

        {!isLoading && sessionRole === 'Admin' && <AdminDashboard />}
        {!isLoading && sessionRole === 'Client' && <ClientDashboard />}
    </div>
  );
}
