'use client';
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,ArrowUpRight,BrainCircuit,CalendarDays,Code2,Github,Lightbulb,Linkedin,Mail,Send,Trophy} from 'lucide-react';
import type {PortfolioData, Profile, Skill} from '@/lib/types';
import {sendMessage} from '@/lib/api';
import {resolveSkillIcon} from '@/lib/skillIcons';
import {UI_ICONS, getNavIcon, getSocialIcon} from '@/lib/icons';
import Particles from './Particles';
import Footer from './Footer';
import TestimonialsSection from './TestimonialsSection';

const iconMap: any = { github: Github, linkedin: Linkedin, mail: Mail };
const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'profiles', label: 'Profiles' },
  { id: 'contact', label: 'Contact' },
];
const anchors = navItems.map(item => item.id);
const month=(v:string)=>new Intl.DateTimeFormat('en',{month:'short',year:'numeric'}).format(new Date(v)).toUpperCase();

function DateBadge({start,end}:{start:string;end?:string}){
  const isCurrent=end?.trim().toLowerCase()==='present';

  return (
    <div className={`timeline-date${isCurrent?' timeline-date--current':''}`}>
      <CalendarDays size={14} aria-hidden="true" focusable="false"/>
      <time dateTime={start}>{month(start)}</time>
      {end&&<>
        <ArrowRight size={14} aria-hidden="true" focusable="false"/>
        <time dateTime={isCurrent?undefined:end}>{isCurrent?'PRESENT':month(end)}</time>
        {isCurrent&&<span className="timeline-date-dot" aria-hidden="true"/>}
      </>}
    </div>
  );
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function HeroRotator({headlines,loading}:{headlines:string[];loading:boolean}){
  const [wordIndex,setWordIndex]=useState(0);
  const [typed,setTyped]=useState('');
  const [deleting,setDeleting]=useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const longestHeadline = useMemo(() => {
    if (!headlines || headlines.length === 0) return '';
    return headlines.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
      ''
    );
  }, [headlines]);

  useIsomorphicLayoutEffect(() => {
    const adjustFontSize = () => {
      const container = containerRef.current;
      const placeholder = ghostRef.current;
      const title = titleRef.current;
      if (!container || !placeholder) return;

      if (window.innerWidth >= 768) {
        container.style.removeProperty('--title-fs');
        placeholder.style.removeProperty('font-size');
        if (title) title.style.removeProperty('font-size');
        return;
      }

      container.style.removeProperty('--title-fs');
      placeholder.style.removeProperty('font-size');
      if (title) title.style.removeProperty('font-size');

      let fs = parseFloat(window.getComputedStyle(placeholder).fontSize) || 28;
      let iterations = 0;
      while (placeholder.scrollWidth > container.clientWidth && fs > 14 && iterations < 20) {
        fs -= 1;
        placeholder.style.fontSize = `${fs}px`;
        if (title) title.style.fontSize = `${fs}px`;
        container.style.setProperty('--title-fs', `${fs}px`);
        iterations++;
      }
    };

    adjustFontSize();

    let rafId: number | null = null;
    const onResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        adjustFontSize();
      });
    };

    window.addEventListener('resize', onResize);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [longestHeadline]);

  useEffect(()=>{
    if(loading)return;
    const word=headlines[wordIndex]||'';
    let delay=deleting?80:130;
    if(!deleting&&typed===word)delay=1800;
    if(deleting&&typed==='')delay=500;
    const t=setTimeout(()=>{
      if(!deleting&&typed===word)setDeleting(true);
      else if(deleting&&typed===''){setDeleting(false);setWordIndex(x=>(x+1)%headlines.length);}
      else setTyped(word.slice(0,typed.length+(deleting?-1:1)));
    },delay);
    return()=>clearTimeout(t);
  },[loading,headlines,wordIndex,typed,deleting]);

  return (
    <div className="rotator" ref={containerRef}>
      <div className="rotator-grid">
        <span className="rotator-ghost" ref={ghostRef} aria-hidden="true">
          {longestHeadline}<span className="type-caret" style={{ visibility: 'hidden' }} aria-hidden="true" />
        </span>
        <h1 className="rotator-title" ref={titleRef} aria-label={headlines[wordIndex]}>
          {typed}<span className="type-caret" aria-hidden="true" />
        </h1>
      </div>
    </div>
  );
}

function DesktopHeader({ items, active, isScrolled, onNavClick }: {
  items: typeof navItems;
  active: string;
  isScrolled: boolean;
  onNavClick: (id: string) => void;
}) {
  return (
    <header
      className={`desktop-header ${isScrolled ? 'visible' : ''}`}
      aria-label="Main navigation"
    >
      <nav>
        {items.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onNavClick(item.id);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function MarqueeRow({
  skills,
  rowIndex,
  isMobile,
}: {
  skills: Skill[];
  rowIndex: number;
  isMobile: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef<HTMLDivElement>(null);
  const [reps, setReps] = useState(1);
  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    const rowEl = rowRef.current;
    const halfEl = halfRef.current;
    if (!rowEl || !halfEl || skills.length === 0) return;

    let rafId: number | null = null;
    const measure = () => {
      const viewportWidth = rowEl.clientWidth;
      const currentScrollWidth = halfEl.scrollWidth;
      const setWidth = currentScrollWidth > 0 ? currentScrollWidth / reps : 300;
      const neededReps = Math.max(1, Math.ceil((viewportWidth || 1) / (setWidth || 1)));

      if (neededReps !== reps) {
        setReps(neededReps);
      }

      const totalHalfWidth = setWidth * neededReps;
      const baseSpeed = isMobile ? 30 : 40; // px/s
      const speedVariation = rowIndex === 1 ? 1.15 : rowIndex === 2 ? 1.05 : 1.0;
      const dur = (totalHalfWidth / baseSpeed) * speedVariation;
      setDuration(Math.max(5, dur));
    };

    const ro = new ResizeObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        measure();
      });
    });

    ro.observe(rowEl);
    measure();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [skills, reps, isMobile, rowIndex]);

  const isReverse = rowIndex % 2 === 1;

  const halfItems: { skill: Skill; key: string }[] = [];
  for (let r = 0; r < reps; r++) {
    for (const s of skills) {
      halfItems.push({ skill: s, key: `${s._id}-r${r}` });
    }
  }

  return (
    <div className="skills-marquee-row" ref={rowRef}>
      <div
        className={`skills-marquee-track ${isReverse ? 'reverse' : ''}`}
        style={{ '--dur': `${duration.toFixed(2)}s` } as React.CSSProperties}
      >
        <div className="skills-marquee-half" ref={halfRef}>
          {halfItems.map(({ skill, key }) => {
            const { Icon } = resolveSkillIcon(skill);
            return (
              <div key={key} className="skill-chip">
                <Icon size={isMobile ? 14 : 15} aria-hidden="true" focusable="false" />
                <span>{skill.name}</span>
              </div>
            );
          })}
        </div>
        <div className="skills-marquee-half" aria-hidden="true">
          {halfItems.map(({ skill, key }) => {
            const { Icon } = resolveSkillIcon(skill);
            return (
              <div key={`${key}-copy`} className="skill-chip">
                <Icon size={isMobile ? 14 : 15} aria-hidden="true" focusable="false" />
                <span>{skill.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkillsMarqueeSection({ skills }: { skills: Skill[] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOffScreen, setIsOffScreen] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsOffScreen(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '100px' }
    );
    io.observe(el);

    const onVis = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const rowCount = isMobile ? 3 : 2;

  const rows = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    const r: Skill[][] = Array.from({ length: rowCount }, () => []);
    skills.forEach((skill, i) => {
      r[i % rowCount].push(skill);
    });
    return r;
  }, [skills, rowCount]);

  const isPaused = isOffScreen || isTabHidden || isHolding;

  if (!skills || skills.length === 0) {
    return (
      <section id="skills" ref={sectionRef} className="page-section">
        <SectionHeading plain="Technical Skills" accent="CORE EXPERTISE!" />
        <div className="empty">Published skills will appear here.</div>
      </section>
    );
  }

  const isMarquee = skills.length >= 8;

  return (
    <section
      id="skills"
      ref={sectionRef}
      className={`page-section skills-section ${isPaused ? 'is-paused' : ''}`}
    >
      <SectionHeading plain="Technical Skills" accent="CORE EXPERTISE!" />

      {!isMarquee ? (
        <ul className="skills-cloud static-cloud" aria-label="Skills and technologies">
          {skills.map(s => {
            const { Icon } = resolveSkillIcon(s);
            return (
              <li key={s._id} className="skill-chip">
                <Icon size={isMobile ? 14 : 15} aria-hidden="true" focusable="false" />
                <span>{s.name}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <ul className="sr-only" aria-label="Skills and technologies">
            {skills.map(s => (
              <li key={s._id}>{s.name}</li>
            ))}
          </ul>

          <div
            className="skills-marquee-container"
            aria-hidden="true"
            onPointerDown={() => setIsHolding(true)}
            onPointerUp={() => setIsHolding(false)}
            onPointerCancel={() => setIsHolding(false)}
            onPointerLeave={() => setIsHolding(false)}
          >
            {rows.map((rowSkills, i) => (
              <MarqueeRow
                key={i}
                skills={rowSkills}
                rowIndex={i}
                isMobile={isMobile}
              />
            ))}
          </div>

          <ul className="skills-cloud static-cloud reduced-motion-only" aria-hidden="true">
            {skills.map(s => {
              const { Icon } = resolveSkillIcon(s);
              return (
                <li key={s._id} className="skill-chip">
                  <Icon size={isMobile ? 14 : 15} aria-hidden="true" focusable="false" />
                  <span>{s.name}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

export default function Portfolio({data}:{data:PortfolioData}){
  const [portfolio, setPortfolio] = useState<PortfolioData>(data);
  const [active,setActive]=useState('home');
  const [loading,setLoading]=useState(true);
  const [isScrolled,setIsScrolled]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const isScrolledRef=useRef(false);
  const activeRef=useRef('home');
  const progressBarRef=useRef<HTMLDivElement>(null);
  const menuBtnRef=useRef<HTMLButtonElement>(null);
  const menuPanelRef=useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
    fetch(`${apiBase}/portfolio`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((fresh) => {
        if (fresh && fresh.profile) {
          setPortfolio(fresh);
        }
      })
      .catch(() => {});
  }, []);

  const profile = portfolio.profile;
  const showExperience = portfolio.experience.length > 0;
  const showProjects = portfolio.projects.length > 0;
  const showTestimonials = (portfolio.testimonials?.length ?? 0) > 0;
  const visibleNav = navItems.filter(i =>
    (i.id !== 'experience' || showExperience) && (i.id !== 'projects' || showProjects)
  );
  const hiddenSections = [...(showExperience ? [] : ['experience']), ...(showProjects ? [] : ['projects'])];

  const headlines = useMemo(() => {
    if (Array.isArray(profile?.heroHeadlines) && profile.heroHeadlines.length > 0) {
      return profile.heroHeadlines.map(x => String(x).trim()).filter(Boolean);
    }
    return ['SOFTWARE ENGINEER', 'FULL STACK DEVELOPER', 'AI DEVELOPER'];
  }, [profile?.heroHeadlines]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(()=>{
    document.body.classList.add('is-loading');
    document.body.classList.remove('page-loaded');
    const started=typeof window!=='undefined'&&(window as Window&{__bootStart?:number}).__bootStart||Date.now();
    const wait=Math.max(700,3200-(Date.now()-started));
    const finishTimer=setTimeout(()=>{
      document.body.classList.remove('is-loading');
      document.body.classList.add('page-loaded');
      setLoading(false);
    },wait);
    return()=>{
      clearTimeout(finishTimer);
      document.body.classList.remove('is-loading');
    };
  },[]);

  useEffect(()=>{
    /* ── Shared scroll handler (floating menu button + progress + spy) ── */
    let rafId: number | null = null;
    const checkScroll = () => {
      const scrolled = window.scrollY > 60;
      if (scrolled !== isScrolledRef.current) {
        isScrolledRef.current = scrolled;
        setIsScrolled(scrolled);
        if (!scrolled) {
          setMenuOpen(false);
        }
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        checkScroll();

        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max ? Math.min(1, window.scrollY / max) : 0;
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${pct})`;
        }

        const timeline = document.querySelector<HTMLElement>('.timeline');
        if (timeline) {
          const rect = timeline.getBoundingClientRect();
          const value = Math.max(0, Math.min(100, ((window.innerHeight * 0.5 - rect.top) / rect.height) * 100));
          timeline.style.setProperty('--timeline-progress', `${value}%`);
          timeline.querySelectorAll<HTMLElement>('.timeline-node').forEach(dot => {
            const line = timeline.getBoundingClientRect();
            const progressH = parseFloat(getComputedStyle(timeline).getPropertyValue('--timeline-progress')) || 0;
            const lineBottom = line.top + (line.height * progressH) / 100;
            dot.classList.toggle('active', lineBottom > dot.getBoundingClientRect().top);
          });
        }
        let current = 'home';
        for (const id of anchors) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id;
        }
        if (current !== activeRef.current) {
          activeRef.current = current;
          setActive(current);
        }
      });
    };

    checkScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(()=>{
    const card=document.querySelector<HTMLElement>('.about .glass-card');
    if(!card)return;
    const reset=()=>{
      if(!card.classList.contains('expanded'))return;
      card.style.transition='transform .8s cubic-bezier(.23,1,.32,1)';
      card.style.transform='perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    };
    const move=(e:PointerEvent)=>{
      if(!card.classList.contains('expanded'))return;
      const rect=card.getBoundingClientRect();
      if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom){reset();return;}
      const x=(e.clientX-rect.left)/rect.width-.5;
      const y=(e.clientY-rect.top)/rect.height-.5;
      card.style.transition='transform .12s ease-out';
      card.style.transform=`perspective(1000px) rotateX(${y*-10}deg) rotateY(${x*10}deg) scale(1.02)`;
    };
    addEventListener('pointermove',move,{passive:true});
    return()=>removeEventListener('pointermove',move);
  },[]);

  useEffect(()=>{
    const cards=document.querySelectorAll<HTMLElement>('.project-card');
    const move=(card:HTMLElement)=>(e:PointerEvent)=>{
      const rect=card.getBoundingClientRect();
      card.style.setProperty('--mouse-x',`${e.clientX-rect.left}px`);
      card.style.setProperty('--mouse-y',`${e.clientY-rect.top}px`);
    };
    const handlers=Array.from(cards).map(card=>{
      const fn=move(card);
      card.addEventListener('pointermove',fn);
      return()=>card.removeEventListener('pointermove',fn);
    });
    return()=>handlers.forEach(off=>off());
  },[loading]);

  useEffect(()=>{
    if(loading)return;
    const about=document.querySelector<HTMLElement>('.about .glass-card');
    const aboutObs=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('expanded',entry.isIntersecting)),{threshold:.3});
    if(about){
      about.classList.add('scroll-reveal');
      aboutObs.observe(about);

      /* Pause the conic border animation when the card is off-screen */
      const animObs=new IntersectionObserver(entries=>entries.forEach(entry=>{
        about.classList.toggle('anim-paused',!entry.isIntersecting);
      }),{threshold:0});
      animObs.observe(about);

      /* Also pause when the browser tab is hidden */
      const onVisibility=()=>about.classList.toggle('anim-paused',document.hidden);
      document.addEventListener('visibilitychange',onVisibility);

      /* Store cleanup refs on the element for the return fn */
      (about as HTMLElement & {_animObs?:IntersectionObserver;_visOff?:()=>void})._animObs=animObs;
      (about as HTMLElement & {_visOff?:()=>void})._visOff=onVisibility;
    }

    const titles=Array.from(document.querySelectorAll<HTMLElement>('.section-heading'));
    titles.forEach(el=>el.classList.add('reveal-item','reveal-title'));
    const cards=Array.from(document.querySelectorAll<HTMLElement>('.experience-card'));
    const projects=Array.from(document.querySelectorAll<HTMLElement>('.project-card'));
    const profiles=Array.from(document.querySelectorAll<HTMLElement>('.profile-grid a, .profiles > p'));
    const contact=[...document.querySelectorAll<HTMLElement>('.contact-intro,.contact-form')];

    projects.forEach((el,i)=>el.style.setProperty('--reveal-delay',`${i*180}ms`));
    profiles.forEach((el,i)=>el.style.setProperty('--reveal-delay',`${i*120}ms`));

    const items=[...titles,...cards,...projects,...profiles,...contact];
    items.forEach(el=>el.classList.add('reveal-item'));

    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }),{threshold:.12,rootMargin:'0px 0px -12%'});
    items.forEach(el=>observer.observe(el));

    /* Part A: Staggered entrance animation for About Me stat cards */
    const statGrid = document.querySelector<HTMLElement>('.stat-row');
    let statObs: IntersectionObserver | null = null;
    if (statGrid) {
      const statCards = Array.from(statGrid.querySelectorAll<HTMLElement>(':scope > div'));
      statCards.forEach((card, i) => {
        card.style.setProperty('--stat-delay', `${i * 100}ms`);
      });

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rect = statGrid.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;

      if (prefersReduced || inView) {
        statGrid.classList.add('stats-revealed');
      } else {
        statGrid.classList.add('stats-waiting');
        statObs = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            statGrid.classList.remove('stats-waiting');
            statGrid.classList.add('stats-revealed');
            statObs?.unobserve(entries[0].target);
          }
        }, { threshold: 0.2 });
        statObs.observe(statGrid);
      }
    }

    /* Pause float icons in hero when off-screen or tab hidden */
    const hero=document.getElementById('home');
    let heroObs:IntersectionObserver|null=null;
    let heroVis:(()=>void)|null=null;
    if(hero){
      heroObs=new IntersectionObserver(entries=>entries.forEach(entry=>{
        hero.classList.toggle('float-icons-paused',!entry.isIntersecting);
      }),{threshold:0});
      heroObs.observe(hero);

      heroVis=()=>{
        if(document.hidden)hero.classList.add('float-icons-paused');
        else if(hero.getBoundingClientRect().bottom>0)hero.classList.remove('float-icons-paused');
      };
      document.addEventListener('visibilitychange',heroVis);
    }

    /* Pause timeline date dot pulse when timeline is off-screen or tab hidden */
    const timeline=document.querySelector<HTMLElement>('.timeline');
    let timelineObs:IntersectionObserver|null=null;
    let timelineVis:(()=>void)|null=null;
    if(timeline){
      timelineObs=new IntersectionObserver(entries=>entries.forEach(entry=>{
        timeline.classList.toggle('timeline-paused',!entry.isIntersecting);
      }),{threshold:0});
      timelineObs.observe(timeline);

      timelineVis=()=>{
        if(document.hidden)timeline.classList.add('timeline-paused');
        else {
          const r=timeline.getBoundingClientRect();
          if(r.top<window.innerHeight&&r.bottom>0)timeline.classList.remove('timeline-paused');
        }
      };
      document.addEventListener('visibilitychange',timelineVis);
    }

    return()=>{
      observer.disconnect();
      aboutObs.disconnect();
      if(statObs)statObs.disconnect();
      if(heroObs)heroObs.disconnect();
      if(heroVis)document.removeEventListener('visibilitychange',heroVis);
      if(timelineObs)timelineObs.disconnect();
      if(timelineVis)document.removeEventListener('visibilitychange',timelineVis);
      /* Clean up animation observers */
      const a=document.querySelector<HTMLElement & {_animObs?:IntersectionObserver;_visOff?:()=>void}>('.about .glass-card');
      if(a){
        a._animObs?.disconnect();
        if(a._visOff)document.removeEventListener('visibilitychange',a._visOff);
      }
    };
  },[loading]);
  useEffect(() => {
    if (menuOpen) {
      if (menuPanelRef.current) {
        menuPanelRef.current.scrollTop = 0;
      }
      const firstLink = menuPanelRef.current?.querySelector<HTMLAnchorElement>('a');
      firstLink?.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuPanelRef.current &&
        !menuPanelRef.current.contains(target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleCloseMenu = () => {
    setMenuOpen(false);
    menuBtnRef.current?.focus();
  };

  const onNavClick = (id: string) => {
    setMenuOpen(false);
    menuBtnRef.current?.focus();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`portfolio ${loading?'content-loading':'content-ready'}`}>
      <Particles/>
      <CustomCursor/>
      <div className="scroll-progress" ref={progressBarRef}/>

      {/* ── Desktop Pill Header (>= 768px) ── */}
      <DesktopHeader items={visibleNav} active={active} isScrolled={isScrolled && !loading} onNavClick={onNavClick} />

      {/* ── Mobile Floating Menu (< 768px) ── */}
      <div className="mobile-nav-only">
        {/* Floating Menu Button */}
        <button
          ref={menuBtnRef}
          type="button"
          className={`floating-menu-btn ${isScrolled && !loading ? 'visible' : ''} ${menuOpen ? 'open' : ''}`}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="advanced-menu-panel"
          onClick={() => setMenuOpen(true)}
        >
          <UI_ICONS.menu size={26} color="#c084fc" aria-hidden="true" focusable="false" />
        </button>

        {/* Advanced Menu Panel */}
        <div
          id="advanced-menu-panel"
          ref={menuPanelRef}
          className={`advanced-menu-panel ${menuOpen && isScrolled && !loading ? 'open' : ''}`}
          aria-hidden={!(menuOpen && isScrolled && !loading)}
        >
          <div className="menu-panel-header">
            <button
              type="button"
              className="menu-close-btn"
              aria-label="Close menu"
              onClick={handleCloseMenu}
            >
              <UI_ICONS.close size={22} color="#c084fc" aria-hidden="true" focusable="false" />
            </button>
          </div>
          <nav className="menu-nav-list" aria-label="Main navigation">
            {visibleNav.map(item => {
              const NavIcon = getNavIcon(item.label);
              const isActive = active === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`menu-nav-link ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavClick(item.id);
                  }}
                >
                  <NavIcon size={20} aria-hidden="true" focusable="false" />
                  <span className="menu-nav-label">{item.label}</span>
                  {isActive && <span className="menu-nav-active-dot" aria-hidden="true" />}
                </a>
              );
            })}
          </nav>
          <hr className="menu-divider" />
          <div className="menu-social-row">
            {portfolio.socialLinks.filter(s => s.enabled).map(s => {
              const SocialIcon = getSocialIcon(s.icon || s.url || s.label);
              return (
                <a
                  key={s._id}
                  href={s.url}
                  target={s.url.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="menu-social-btn"
                  aria-label={s.label}
                  onClick={handleCloseMenu}
                >
                  <SocialIcon size={23} color="#c084fc" aria-hidden="true" focusable="false" />
                </a>
              );
            })}
          </div>
          <button
            type="button"
            className="menu-connect-btn"
            onClick={() => onNavClick('contact')}
          >
            LET&apos;S CONNECT
          </button>
        </div>
      </div>

      <main>
        <section id="home" className="hero">
          <div className="float-icon code"><Code2/></div>
          <div className="float-icon brain"><BrainCircuit/></div>
          <div className="float-icon trophy"><Trophy/></div>
          <div className="float-icon bulb"><Lightbulb/></div>
          <div className="hero-inner">
            <p className="welcome">{profile?.heroIntro || portfolio.profile.heroIntro}</p>
            <HeroRotator headlines={headlines} loading={loading}/>
            <h2>{profile?.fullName || portfolio.profile.fullName}</h2>
            <div className="hero-actions">
              <a href="#contact">LET&apos;S CONNECT</a>
              {showProjects&&<a href="#projects">VIEW PROJECTS</a>}
            </div>
          </div>
        </section>
        <section id="about" className="page-section about">
          <div className="glass-card glass-card--animated">
            <SectionHeading plain="About Me" accent="BEHIND THE CODE!"/>
            <p>{profile?.about || portfolio.profile.about}</p>
            <div className="stat-row">{(profile?.stats || portfolio.profile.stats).map(x=><div key={x.label}><strong>{x.value}</strong><span>{x.label}</span></div>)}</div>
          </div>
        </section>
        {showExperience&&<section id="experience" className="page-section">
          <SectionHeading plain="Work Experience" accent="PROFESSIONAL JOURNEY!"/>
          <div className="timeline">{portfolio.experience.map((x,i)=>(
            <article className={`experience-card ${i%2?'right':'left'}`} key={x._id}>
              <span className="timeline-number">0{i+1}</span>
              <div className="timeline-node timeline-node--desktop"/>
              <div className="timeline-header-row">
                <div className="timeline-node timeline-node--mobile"/>
                <DateBadge start={x.startDate} end={x.current?'Present':x.endDate}/>
              </div>
              <div className="experience-panel">
                <span className="company-pill">{x.company}</span>
                <div className="role-icon"><Code2/></div>
                <h3>{x.role}</h3>
                <p>{x.description}</p>
                {x.highlights?.length>0&&<ul>{x.highlights.map(h=><li key={h}>{h}</li>)}</ul>}
              </div>
            </article>
          ))}</div>
        </section>}
        {showProjects&&<section id="projects" className="page-section">
          <SectionHeading plain="Projects Showcase" accent="WHAT I'VE BUILT!"/>
          <div className="projects-grid">{portfolio.projects.length?portfolio.projects.map((p,i)=>(
            <article className="project-card" key={p._id}>
              <div className="project-meta"><span>{p.featured?'Featured Project':'Full-Stack Project'}</span><b>0{i+1}</b></div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="tech-list">{p.technologies.map(t=><span key={t}>{t}</span>)}</div>
              <a className="view-live" href={p.liveUrl} target="_blank" rel="noopener noreferrer"><ArrowUpRight/> VIEW LIVE</a>
            </article>
          )):<div className="empty">Published projects will appear here.</div>}</div>
        </section>}
        <SkillsMarqueeSection skills={portfolio.skills} />
        {showTestimonials&&<TestimonialsSection testimonials={portfolio.testimonials} />}
        <section id="profiles" className="page-section profiles">
          <SectionHeading plain="Web Presence" accent="DEV NETWORK!"/>
          <div className="profile-grid">{portfolio.socialLinks.filter(s=>s.enabled).map(s=>{const I=iconMap[s.icon]||ArrowUpRight;return <a key={s._id} href={s.url} target={s.url.startsWith('http')?'_blank':undefined} rel="noopener noreferrer"><I/><strong>{s.label}</strong><span>{s.icon==='github'?'COMMIT':s.icon==='linkedin'?'CONNECT':'CONTACT'}</span></a>;})}</div>
          <p>You can explore further by clicking on any of the profile cards above!</p>
        </section>
        <section id="contact" className="page-section contact">
          <SectionHeading plain="Get In Touch" accent="LET'S CONNECT!"/>
          <p className="contact-intro">I&apos;m always open to new opportunities and interesting conversations.</p>
          <ContactForm/>
        </section>
      </main>
      <Footer
        profile={profile || portfolio.profile}
        socialLinks={portfolio.socialLinks}
        role={portfolio.experience[0]?.role}
        hiddenSections={hiddenSections}
      />
    </div>
  );
}

function SectionHeading({plain,accent}:{plain:string;accent:string}){
  return <h2 className="section-heading">{plain} - <span>{accent}</span></h2>;
}

function CustomCursor(){
  const ring=useRef<HTMLDivElement>(null);
  const dot=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const move=(e:PointerEvent)=>{
      if(dot.current){
        dot.current.style.left=`${e.clientX}px`;
        dot.current.style.top=`${e.clientY}px`;
      }
      ring.current?.animate({left:`${e.clientX}px`,top:`${e.clientY}px`},{duration:500,fill:'forwards'});
    };
    const over=(e:Event)=>ring.current?.classList.toggle('hovering',!!(e.target as Element)?.closest('a,button,input,textarea,.float-icon'));
    addEventListener('pointermove',move);
    addEventListener('pointerover',over);
    return()=>{removeEventListener('pointermove',move);removeEventListener('pointerover',over);};
  },[]);
  return <><div ref={ring} className="custom-cursor"/><div ref={dot} className="cursor-dot"/></>;
}

function ContactForm(){
  const [form,setForm]=useState({name:'',email:'',subject:'Portfolio enquiry',message:''});
  const [status,setStatus]=useState('');
  async function submit(e:React.FormEvent){
    e.preventDefault();
    setStatus('SENDING…');
    try{
      await sendMessage(form);
      setStatus('MESSAGE SENT SUCCESSFULLY');
      setForm({name:'',email:'',subject:'Portfolio enquiry',message:''});
    }catch(err:any){setStatus(err.message.toUpperCase());}
  }
  return (
    <form className="contact-form" onSubmit={submit} noValidate={false}>
      <label><span>Name</span><input required minLength={2} name="name" autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label><span>Email</span><input required type="email" name="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label><span>Subject</span><input required name="subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label>
      <label><span>Message</span><textarea required minLength={10} name="message" rows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label>
      <button type="submit">SEND MESSAGE <Send size={16} aria-hidden="true"/></button>
      {status&&<p role="status">{status}</p>}
    </form>
  );
}
