import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutDashboard, Users, Target, Megaphone, Brain, Lightbulb, Clipboard, FileText, Zap, GraduationCap, Play, Clock, ChevronLeft, Share2, Lock, CheckCircle, Filter, X, BookOpen, Pen, Trash2, Download, Globe2, ExternalLink, Headphones, BookMarked, Sparkles, ChevronDown, Library, Video, CalendarDays, GripVertical, Plus, ChevronUp, ChevronRight, Save, Type } from "lucide-react";

const LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='40'%3E%3Ctext x='17' y='28' font-family='sans-serif' font-size='13' font-weight='900' fill='%23E2DD9F' text-anchor='middle'%3EBAM%3C/text%3E%3C/svg%3E";
const GOLD = "#E2DD9F";

// ── ANALYTICS HELPER ───────────────────────────────────────────────────────
function logEvent(name, data = {}) {
  try {
    const events = JSON.parse(localStorage.getItem("bam_analytics_events") || "[]");
    events.push({ name, ...data, ts: Date.now() });
    localStorage.setItem("bam_analytics_events", JSON.stringify(events));
  } catch {}
}

// ── CALLS HELPERS ──────────────────────────────────────────────────────────
const WEEKLY_MEET_LINK = "https://meet.google.com/bam-coaches-weekly";

function getNextMondays(count) {
  const dates = [];
  const d = new Date();
  // find next Monday (or today if Monday)
  const day = d.getDay();
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(19, 0, 0, 0); // 7 PM
  for (let i = 0; i < count; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return dates;
}

function getAdHocCalls() {
  try { return JSON.parse(localStorage.getItem("bam_adhoc_calls") || "[]"); } catch { return []; }
}

function getAllUpcomingCalls() {
  const now = Date.now();
  const weeklyCalls = getNextMondays(8).map((d, i) => ({
    id: `weekly-${i}`, title: "BAM Coaches Weekly Call", dateTime: d.getTime(),
    meetLink: WEEKLY_MEET_LINK, type: "weekly",
  }));
  const adHoc = getAdHocCalls().map(c => ({
    ...c, dateTime: new Date(c.dateTime).getTime(), type: "adhoc",
  }));
  return [...weeklyCalls, ...adHoc].filter(c => c.dateTime > now).sort((a, b) => a.dateTime - b.dateTime);
}

function fmtCountdown(ms) {
  if (ms <= 0) return "Now";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

const DARK = {
  bg:"#1A1A1A", bgCard:"#242424", bgHover:"#2E2E2E",
  border:"#333", gold:GOLD, goldDim:"rgba(226,221,159,0.10)",
  text:"#F2F2F2", textMid:"#B0B0B0", textDim:"#666",
  green:"#5AB584", greenDim:"rgba(90,181,132,0.14)",
  blue:"#7AABCF", blueDim:"rgba(122,171,207,0.14)",
  shadow:"rgba(0,0,0,0.5)",
};
const LIGHT = {
  bg:"#FFFFFF", bgCard:"#FFFFFF", bgHover:"#F5F5F5",
  border:"#E8E8E8", gold:GOLD, goldDim:"rgba(226,221,159,0.4)",
  text:"#111111", textMid:"#444444", textDim:"#999999",
  green:"#2D7A50", greenDim:"rgba(45,122,80,0.10)",
  blue:"#2A527A", blueDim:"rgba(42,82,122,0.10)",
  shadow:"rgba(0,0,0,0.07)",
};

const SBcard="#242424", SBborder="#333", SBtext="#F2F2F2", SBmid="#B0B0B0", SBdim="#555";

const NAV = [
  { id:"dashboard", label:"Dashboard",        Icon:LayoutDashboard, group:"main" },
  { id:"community", label:"Community",         Icon:Users,           group:"main" },
  // Library — Player Development
  { id:"pd",        label:"Drills & Games",    Icon:Target,          group:"pd",   parent:"pd" },
  { id:"insights",  label:"Insights",          Icon:Brain,           group:"pd",   parent:"pd" },
  // Library — Team Coaching
  { id:"team",      label:"Drills & Games",    Icon:Megaphone,       group:"team", parent:"team" },
  { id:"ti",        label:"Insights",          Icon:Lightbulb,       group:"team", parent:"team" },
  { id:"xo",        label:"X & O Breakdowns",  Icon:Clipboard,       group:"team", parent:"team" },
  // Library — standalone
  { id:"plans",     label:"Practice Plans",    Icon:FileText,        group:"lib" },
  { id:"master",    label:"Masterclasses",     Icon:GraduationCap,   group:"lib" },
  { id:"workouts",  label:"Full Workouts",     Icon:Zap,             group:"lib" },
  { id:"playbook",  label:"Playbook Builder",  Icon:BookOpen,        group:"lib" },
  { id:"resources", label:"Resources",         Icon:Library,         group:"main" },
];

// Thumb colors per section
const SECTION_COLORS = {
  pd:       ["#3D6B5E","#4A5E7A","#6B4A5E","#5E5A3D","#3D5E6B","#5E3D4A","#4A6B4A","#7A5E3D"],
  team:     ["#5E3D3D","#3D4A6B","#5E5E3D","#3D6B4A","#6B3D5E","#4A6B5E","#5E4A3D","#3D5E5E"],
  insights: ["#4A3D6B","#3D6B5E","#6B5E3D","#3D4A5E","#5E3D6B","#6B4A3D","#3D6B6B","#5E5E4A"],
  ti:       ["#3D5E4A","#5E3D5E","#4A5E3D","#6B4A4A","#3D3D6B","#5E6B3D","#4A3D5E","#6B5E4A"],
  xo:       ["#5E4A3D","#3D5E6B","#6B3D3D","#4A6B3D","#3D4A6B","#6B5E3D","#3D6B4A","#5E3D6B"],
  plans:    ["#4A6B3D","#5E3D4A","#3D5E5E","#6B4A5E","#3D6B3D","#5E5E3D","#4A3D6B","#6B3D5E"],
  workouts: ["#6B3D3D","#3D6B4A","#5E4A6B","#4A6B5E","#6B5E3D","#3D4A5E","#5E6B4A","#4A3D3D"],
  master:   ["#5E3D5E","#3D5E3D","#6B4A3D","#4A4A6B","#3D6B5E","#5E3D3D","#6B6B3D","#3D4A4A"],
};

// Content data per section
const CONTENT = {
  pd: {
    title:"Player Development Drills & Games",
    desc:"Individual player development drills, constraint-based games, and skill-building progressions.",
    filters:["All","Finishing","Shooting","Handles","Defense","1v1"],
    items:[
      {id:1,title:"1v1 Live Finishing",sub:"Constraint Drill",duration:"12 min",level:"Intermediate",tag:"Finishing",isNew:true,desc:"A live 1v1 finishing drill using a 2-dribble constraint to force quick decisions and creative finishes around the rim. Progress from stationary catches to full live reps.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Set up cones at the elbow extended on both sides","Offensive player receives pass and must finish in 2 dribbles","Defender plays 80% live — enough pressure to force reads","Progress: catch & shoot → 1 dribble → 2 dribble → live"]},
      {id:2,title:"Catch & Shoot Progression",sub:"Shooting Series",duration:"18 min",level:"All Levels",tag:"Shooting",isNew:true,desc:"A systematic catch-and-shoot progression building from stationary form work to live off-ball movement patterns.",coach:"Marcus T.",coachInitials:"MT",keyPoints:["Start with 5-spot stationary work — 3 makes per spot","Add a jab step before each catch in round 2","Round 3: full off-ball cut into the catch-and-shoot","Track makes/attempts at each station"]},
      {id:3,title:"Ball Handling Decision Game",sub:"Competitive Game",duration:"20 min",level:"Advanced",tag:"Handles",isNew:false,desc:"A competitive 1v1 dribble game with defender calling out colors to trigger specific moves. Forces handles under cognitive load.",coach:"Yuki T.",coachInitials:"YT",keyPoints:["Offense starts with ball at half court","Defender calls colors — each color triggers a different move","Blue = crossover, Red = behind back, Gold = hesitation","First to 5 wins, rotate every 3 points"]},
      {id:4,title:"Closeout & Contest Drill",sub:"Defensive Drill",duration:"15 min",level:"Intermediate",tag:"Defense",isNew:false,desc:"A high-repetition closeout drill teaching proper footwork and hand positioning on jump shooters and shot fakers.",coach:"Sofia R.",coachInitials:"SR",keyPoints:["Defender starts under basket, offensive player at 3pt line","Coach or passer initiates, defender sprints to closeout","Emphasize chop steps on approach — no flying by","Rotate through 3 positions: corner, wing, top"]},
      {id:5,title:"One-Dribble Pull-Up Series",sub:"Shooting Drill",duration:"14 min",level:"Intermediate",tag:"Finishing",isNew:false,desc:"Isolated mid-range and paint pull-up work off one dribble. Builds the skill most players neglect between the 3 and the rim.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Start at the elbow — catch, one dribble hard left or right","Finish with pull-up at the mid-range area","Add a defender in round 2 who shades one direction","Track preferred hand vs off-hand makes"]},
      {id:6,title:"2v2 Shell Read Game",sub:"Decision Game",duration:"25 min",level:"Advanced",tag:"1v1",isNew:false,desc:"A 2v2 game with specific read rules that force players to make the correct decision off the ball screen action.",coach:"James O.",coachInitials:"JO",keyPoints:["Ball screen at the top, screener pops or rolls based on defense","Offense must verbalize the read before executing","Scoring: +1 for correct read, +2 for score, -1 for wrong read","Play to 7, defense stays on if they hold the offense under 4"]},
    ]
  },
  team: {
    title:"Team Drills & Games",
    desc:"Group drills, small-sided games, and team-building activities for practice environments.",
    filters:["All","Offense","Defense","Transition","5v5","Competitive"],
    items:[
      {id:1,title:"3v3 Scramble Game",sub:"Competitive Game",duration:"20 min",level:"All Levels",tag:"Competitive",isNew:true,desc:"Continuous 3v3 scramble with quick rotations. No set plays — forces players to read and react in real time.",coach:"Kwame D.",coachInitials:"KD",keyPoints:["3v3 on half court, first to 5 wins","Winning team stays, losing team rotates out","No plays called — reads only","Coach can add live constraints mid-game"]},
      {id:2,title:"Transition Advantage Drill",sub:"Transition Offense",duration:"18 min",level:"Intermediate",tag:"Transition",isNew:true,desc:"Structured transition drill creating different numerical advantages — 2v1, 3v2, 4v3 — to build decision-making in the open court.",coach:"Sofia R.",coachInitials:"SR",keyPoints:["Coach initiates with a defensive rebound and outlet","Numbers are pre-set each rep — offense must execute or it's a turnover","Rotate advantage each set: 3 reps at each number","Track decisions — score the correct read regardless of make"]},
      {id:3,title:"Shell Defensive System",sub:"Defensive System",duration:"30 min",level:"Intermediate",tag:"Defense",isNew:false,desc:"Progressive shell drill teaching team help principles from 4v0 walk-through to 4v4 live.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Start 4v0: walk through help positions on ball movement","4v2: offense moves ball, defense adjusts to proper spots","4v4 restricted: offense cannot shoot — defense only","4v4 live: full reps with scoring"]},
      {id:4,title:"5v5 Competitive Scoring Game",sub:"5v5 Game",duration:"35 min",level:"Advanced",tag:"5v5",isNew:false,desc:"Full 5v5 with a coaching-point scoring overlay — bonus points for specific actions the team is working on that week.",coach:"James O.",coachInitials:"JO",keyPoints:["Standard 5v5 scoring plus a points overlay","Bonus +1: kick-out 3 off drive-and-kick","Bonus +1: post touch to kick to corner","Penalty -1: forced shot, turnover on bad read","Coach tracks overlay score separately"]},
    ]
  },
  insights: {
    title:"Player Development Insights",
    desc:"Research-backed reads, frameworks, and breakdowns on individual player development philosophy.",
    filters:["All","Development","Psychology","Methodology","Culture","Research"],
    items:[
      {id:1,title:"Constraints-Led Approach: A Primer",sub:"Methodology",duration:"8 min read",level:"All Levels",tag:"Methodology",isNew:true,desc:"A clear breakdown of constraints-led coaching and how it applies to basketball skill acquisition. Why rules beat repetition.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["What is CLA and where it comes from","How task, environment, and individual constraints shape behavior","3 drill examples and how to apply the constraint","Common mistakes coaches make when implementing CLA"]},
      {id:2,title:"The Quiet Eye in Basketball",sub:"Research",duration:"6 min read",level:"Advanced",tag:"Research",isNew:true,desc:"Research-backed breakdown of the 'quiet eye' phenomenon in shooting and finishing. What elite players see that others don't.",coach:"Sofia R.",coachInitials:"SR",keyPoints:["What quiet eye is and the original research","How it applies to free throws, catch-and-shoot, and finishing","Training techniques to develop quiet eye in players","Why anxious players lose quiet eye under pressure"]},
      {id:3,title:"Building Intrinsic Motivation",sub:"Psychology",duration:"10 min read",level:"All Levels",tag:"Psychology",isNew:false,desc:"How to build environments where players want to improve — without bribes, punishment, or artificial pressure.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Self-determination theory simplified for coaches","Autonomy: giving players real choices in practice","Competence: designing drills at the right challenge level","Relatedness: why team culture drives individual development"]},
      {id:4,title:"Cultural Context in Player Development",sub:"Culture",duration:"12 min read",level:"All Levels",tag:"Culture",isNew:false,desc:"How cultural background shapes how players receive feedback, process failure, and define success. Essential reading for global coaches.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["How collectivist vs individualist cultures process feedback","Adaptation strategies for coaches working globally","Case studies: coaching in West Africa, Japan, and Europe","Building cross-cultural trust quickly"]},
    ]
  },
  ti: {
    title:"Team Insights",
    desc:"Team-level strategy, system design, and culture-building frameworks for coaches.",
    filters:["All","Strategy","Culture","Systems","Communication","Analytics"],
    items:[
      {id:1,title:"Building Your Defensive Identity",sub:"Systems",duration:"9 min read",level:"All Levels",tag:"Systems",isNew:true,desc:"A framework for choosing and installing a defensive identity that matches your personnel and philosophy — not just copying what works elsewhere.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Why identity must come before scheme","4 defensive identity types and which players fit each","Installation order: principle → positioning → reads → scheme","How to test if your identity is working mid-season"]},
      {id:2,title:"Practice Design Principles",sub:"Strategy",duration:"11 min read",level:"All Levels",tag:"Strategy",isNew:true,desc:"How to design practices that produce real transfer to game performance — not just good-looking reps.",coach:"Sofia R.",coachInitials:"SR",keyPoints:["The transfer spectrum: blocked → random → competitive","Why blocked practice feels productive but often isn't","Designing for desirable difficulty","Practice plan template with built-in transfer principles"]},
      {id:3,title:"Team Communication Systems",sub:"Communication",duration:"7 min read",level:"All Levels",tag:"Communication",isNew:false,desc:"How to create communication habits that survive the pressure of games — on and off the court.",coach:"James O.",coachInitials:"JO",keyPoints:["The 3 communication breakdowns that lose games","Installing defensive call systems that stick","Offensive communication: reads, tags, and triggers","Building a culture where players talk without prompting"]},
    ]
  },
  xo: {
    title:"X & O Breakdowns",
    desc:"Play diagrams, set play libraries, and strategic breakdowns from professional and international basketball.",
    filters:["All","Sets","ATO","BLOB","SLOB","Half Court"],
    items:[
      {id:1,title:"Spain Pick & Roll",sub:"Half Court Set",duration:"6 min",level:"Intermediate",tag:"Half Court",isNew:true,desc:"The iconic Spain PnR — a back screen on the rolling big to create a lob or open roll. Breakdown of the action and how to defend it.",coach:"Sofia R.",coachInitials:"SR",keyPoints:["Ball screen initiated at the top","Back screener targets the ball screen defender","Read: lob to roller if defense switches, pull-up if they go under","Defensive adjustment: switch the back screen first"]},
      {id:2,title:"Horns Set — 3 Reads",sub:"Half Court Set",duration:"8 min",level:"All Levels",tag:"Sets",isNew:true,desc:"A breakdown of the Horns formation and 3 distinct actions that can run from the same initial alignment.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Horns alignment: 2 bigs at elbows, guards in corners","Action 1: DHO into ball screen","Action 2: Elbow isolation with pin-down","Action 3: 5-out motion trigger"]},
      {id:3,title:"ATO — Last Second Plays",sub:"ATO",duration:"10 min",level:"Advanced",tag:"ATO",isNew:false,desc:"5 proven ATOs (After Timeout plays) from international competition, with diagrams and read keys for each.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["1-second ATO: quick hitter off the inbound","3-second ATO: one action, clear read","7-second ATO: two-option play with a safety valve","Principles for calling the right ATO in the right situation"]},
      {id:4,title:"BLOB — Baseline Out of Bounds",sub:"BLOB",duration:"7 min",level:"All Levels",tag:"BLOB",isNew:false,desc:"4 baseline out-of-bounds plays with different scoring options — corner 3, mid-range, lob, and short roll.",coach:"Marcus T.",coachInitials:"MT",keyPoints:["Stack BLOB into corner 3","Double-screen BLOB for the lob","Flat BLOB into mid-range","How to scout and adjust against denying defenses"]},
    ]
  },
  plans: {
    title:"Practice Plans",
    desc:"Ready-to-run practice plans for different levels, settings, and time constraints.",
    filters:["All","60 min","90 min","120 min","Youth","Pro"],
    items:[
      {id:1,title:"60-Min Skill Development Plan",sub:"Individual Focus",duration:"60 min",level:"Youth",tag:"60 min",isNew:true,desc:"A complete 60-minute practice focused on individual skill development for youth players. Breakdown by segment with timing.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["0-10: Dynamic warmup and ball handling","10-25: Shooting progression (catch & shoot → off movement)","25-40: 1v1 live drill — finishing constraint","40-55: Competitive game with coaching points overlay","55-60: Film review and debrief"]},
      {id:2,title:"90-Min Team Practice Plan",sub:"Full Team",duration:"90 min",level:"Intermediate",tag:"90 min",isNew:true,desc:"A full team practice plan with individual skill work built into team concepts. High tempo with clear transitions.",coach:"James O.",coachInitials:"JO",keyPoints:["0-15: Position-specific skill warmup","15-35: Shell drill progression (4v0 → 4v4)","35-55: Offensive system install — one action","55-75: 5v5 competitive with scoring overlay","75-90: Free throw work and film"]},
      {id:3,title:"Pre-Game Warmup Plan",sub:"Game Day",duration:"45 min",level:"All Levels",tag:"60 min",isNew:false,desc:"A complete pre-game warmup sequence designed to activate players physically and mentally before tip-off.",coach:"Sofia R.",coachInitials:"SR",keyPoints:["0-8: Dynamic movement, no ball","8-20: Ball handling and shooting warmup","20-32: Team walk-through — offense and defense keys","32-40: Competitive 3v3 at game speed","40-45: Set shot routine and huddle"]},
    ]
  },
  workouts: {
    title:"Full Workouts",
    desc:"Complete on-court workouts for individual players at every position and level.",
    filters:["All","Guard","Forward","Big","Shooting","Athleticism"],
    items:[
      {id:1,title:"Guard Scoring Workout",sub:"Full Workout",duration:"55 min",level:"Intermediate",tag:"Guard",isNew:true,desc:"A complete guard scoring workout covering finishing, pull-ups, and 3-point shooting with live reps at the end.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Warmup: form shooting + ball handling (10 min)","Block 1: Finishing progression — layup → floater → pull-up (15 min)","Block 2: Catch & shoot from 5 spots (15 min)","Block 3: 1v1 live scoring reps (10 min)","Cooldown: Free throws and stretch (5 min)"]},
      {id:2,title:"Big Man Development Workout",sub:"Full Workout",duration:"60 min",level:"Intermediate",tag:"Big",isNew:true,desc:"A position-specific workout for bigs covering post moves, short roll finishing, and pick-and-pop shooting.",coach:"Kwame D.",coachInitials:"KD",keyPoints:["Post entry and footwork series (15 min)","Short roll finishing — catch in traffic (15 min)","Pick-and-pop to mid-range (15 min)","Competitive: back-to-basket 1v1 (10 min)","Recovery: mobility and stretch (5 min)"]},
      {id:3,title:"Shooting Specialist Workout",sub:"Full Workout",duration:"45 min",level:"All Levels",tag:"Shooting",isNew:false,desc:"High-volume shooting workout for players whose primary role is off-ball shooting and catch-and-shoot execution.",coach:"Marcus T.",coachInitials:"MT",keyPoints:["Off-movement catch & shoot — 5 patterns (20 min)","Pin-down series into catch & shoot (10 min)","DHO into 3 — 3 angles (10 min)","Game shots: contested closeout shooting (5 min)"]},
    ]
  },
  master: {
    title:"Masterclasses",
    desc:"Deep-dive video series and long-form coaching education from elite coaches around the world.",
    filters:["All","Player Dev","Team Building","Systems","Mental Performance","Global Game"],
    items:[
      {id:1,title:"Constraint-Led Coaching Masterclass",sub:"6-Part Series",duration:"4.5 hrs",level:"All Levels",tag:"Player Dev",isNew:true,desc:"A complete 6-part masterclass on constraint-led coaching — from theory to full implementation in your practice environment.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Part 1: What CLA is and the science behind it","Part 2: Designing task constraints for skill acquisition","Part 3: Environmental constraints — court, equipment, space","Part 4: Individual constraints — rules and challenges","Part 5: Implementing CLA in team practices","Part 6: Measuring and adjusting over a season"]},
      {id:2,title:"Building Global Basketball Culture",sub:"3-Part Series",duration:"2.5 hrs",level:"All Levels",tag:"Global Game",isNew:true,desc:"A 3-part series on coaching across cultures, building inclusive environments, and developing players from diverse backgrounds.",coach:"Coleman Ayers",coachInitials:"CA",keyPoints:["Part 1: Understanding cultural context in player development","Part 2: Communication across cultural backgrounds","Part 3: Building a global scouting and development system"]},
      {id:3,title:"Mental Performance for Coaches",sub:"4-Part Series",duration:"3 hrs",level:"All Levels",tag:"Mental Performance",isNew:false,desc:"How to build mental toughness, resilience, and performance mindset in your players — and yourself.",coach:"Sofia R.",coachInitials:"SR",keyPoints:["Part 1: The science of pressure performance","Part 2: Building pre-performance routines","Part 3: Coaching through failure and setbacks","Part 4: Sustaining coach mental health in a high-demand role"]},
    ]
  },
};

const AVATAR_COLORS = ["#5B7FA6","#6B9E7A","#9E6B7A","#9E8A5B","#7A6B9E","#5B9E8A","#9E7A5B","#6B7A9E"];
const getAC = (n) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];

const PROMPTS = ["Share a drill you ran this week — what was the constraint?","What coaching problem are you working through right now?","Drop a win from this week that most people would overlook.","How do you handle a player who won't commit under pressure?","Where are you coaching and what's different about the game there?","What resource has shaped your coaching most this year?"];
const HINTS = ["Search drills, coaches, insights...","Try \"finishing under contact\"...","Search by coach name...","Find practice plans...","Try \"ball handling games\"..."];
const MEMBERS = {
  "Marcus T.":  {initials:"MT",loc:"Toronto, CA",   flag:"🇨🇦",posts:47,ig:"marcust_hoops", tw:"marcust_coach",bio:"U16-U19 skills coach. Obsessed with constraint-led design."},
  "James O.":   {initials:"JO",loc:"Lagos, NG",     flag:"🇳🇬",posts:38,ig:"jamesodribbles",tw:null,           bio:"Head coach, Lagos Elite Academy. Building the next wave."},
  "Sofia R.":   {initials:"SR",loc:"Barcelona, ES", flag:"🇪🇸",posts:31,ig:null,            tw:"sofiarbasket", bio:"Player development coach & sports scientist. FCB methodology."},
  "Kwame D.":   {initials:"KD",loc:"Accra, GH",     flag:"🇬🇭",posts:22,ig:"kwame_develops",tw:null,           bio:"Founder, Ghana Hoops Academy. Growing the game in West Africa."},
  "Yuki T.":    {initials:"YT",loc:"Osaka, JP",     flag:"🇯🇵",posts:29,ig:"yukitrains",    tw:null,           bio:"Finishing specialist. 10 years developing guards in Japan."},
  "Coleman Ayers":{initials:"CA",loc:"Miami, FL",   flag:"🇺🇸",posts:84,ig:"coachbam",      tw:"coachbam",     bio:"Founder, BAM Basketball. Building the global game by any means."},
};
// Gather all content items across all sections for dashboard use
const ALL_CONTENT_ITEMS = Object.entries(CONTENT).flatMap(([sid,sec])=>(sec.items||[]).map(i=>({...i,sectionId:sid})));

const POSTS_DATA = [
  {id:1,author:"Marcus T.", time:"2h ago", tag:"Drill Drop",title:"1v1 live finishing — 2 dribble constraint",media:[{type:"image",url:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='340' viewBox='0 0 700 340'%3E%3Crect width='700' height='340' fill='%23B5651D'/%3E%3Crect x='0' y='0' width='700' height='340' fill='none' stroke='%23fff' stroke-width='3' opacity='0.6'/%3E%3Ccircle cx='350' cy='170' r='60' fill='none' stroke='%23fff' stroke-width='3' opacity='0.6'/%3E%3Cline x1='350' y1='0' x2='350' y2='340' stroke='%23fff' stroke-width='2' opacity='0.4'/%3E%3Crect x='50' y='95' width='160' height='150' fill='none' stroke='%23fff' stroke-width='2' opacity='0.5'/%3E%3Crect x='490' y='95' width='160' height='150' fill='none' stroke='%23fff' stroke-width='2' opacity='0.5'/%3E%3Ccircle cx='350' cy='170' r='8' fill='%23fff' opacity='0.7'/%3E%3Ctext x='350' y='290' font-family='sans-serif' font-size='13' fill='white' opacity='0.5' text-anchor='middle'%3E1v1 Drill Setup — U16 Session%3C/text%3E%3C/svg%3E",name:"drill-setup.jpg"}],content:"Used 1v1 live finishing with my U16s — constraint of only 2 dribbles forced incredible creativity.",likes:24,replies:["Great constraint. I use a similar one but add a defender decision too.","This is exactly what I needed. Running it tomorrow."]},
  {id:2,author:"James O.",  time:"4h ago", tag:"Win",       title:"My quietest player came through in crunch time",content:"Big win this week — my quietest player made a key decision in crunch time we had been building toward for months.",likes:31,replies:["These are the moments. The quiet ones always surprise you."]},
  {id:3,author:"Sofia R.",  time:"1d ago", tag:"Question",  title:"How do you coach transition decision-making without freezing players?",media:[{type:"pdf",url:"#",name:"Transition-Decision-Framework.pdf",size:"1.8 MB"}],content:"How do you coach decision-making in transition without over-coaching it? Players freeze when they have numbers advantages.",likes:18,replies:["We use a points system — reward the right decision regardless of outcome.","Silence after the rep. Let them feel the mistake."]},
  {id:4,author:"Kwame D.",  time:"2d ago", tag:"Drill Drop",title:"3v3 scramble — chaos by design",content:"3v3 scramble has been my go-to this month. Chaos by design — players forced to read and react constantly.",likes:15,replies:["What constraints do you add to keep it from becoming too random?"]},
  {id:5,author:"Yuki T.",   time:"3d ago", tag:"Insight",   title:"3-week finishing under contact block — the progression works",content:"Finished a 3-week block on finishing under contact. On-air to semi-live to full live. The jump in confidence was visible.",likes:29,replies:["How long were your on-air blocks?","This progression is underrated."]},
];
const TRENDING_POSTS = [...POSTS_DATA].sort((a,b)=>(b.likes+b.replies.length*2)-(a.likes+a.replies.length*2));
const LEADERBOARD = [{n:"Marcus T.",pts:247,i:"MT"},{n:"James O.",pts:198,i:"JO"},{n:"Sofia R.",pts:156,i:"SR"},{n:"Kwame D.",pts:112,i:"KD"}];
const ALL_TAGS_COMM = ["All","Drill Drop","Win","Question","Insight"];
const CARD_BORDERS = ["#E2DD9F","#555555","#C8C090","#3D3D3D","#A8A070"];
const getCardBorder = (id) => CARD_BORDERS[id % CARD_BORDERS.length];

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.ni{transition:all .15s ease;cursor:pointer;border-left:3px solid transparent;}
.ni:hover{background:rgba(255,255,255,0.05)!important;}
.pc{transition:transform .18s ease,box-shadow .18s ease;cursor:pointer;}
.pc:hover{transform:scale(1.007);box-shadow:var(--hs)!important;}
.cc{transition:transform .18s ease,box-shadow .18s ease;cursor:pointer;}
.cc:hover{transform:translateY(-3px);box-shadow:var(--hs)!important;}
.tc{transition:transform .2s ease;cursor:pointer;}
.tc:hover{transform:scale(1.013);}
.btn{transition:opacity .15s;cursor:pointer;}
.btn:hover{opacity:.65;}
.lbtn{cursor:pointer;transition:color .15s,transform .1s;}
.lbtn:active{transform:scale(1.4);}
.lpop{animation:lpop .32s ease;}
.pg{animation:pgIn .3s ease both;}
.ttgl{transition:background .25s;cursor:pointer;}
.tthm{transition:transform .25s;}
.compose-pulse{animation:composePulse 3s ease-in-out infinite;}
.tag-pill{transition:all .15s ease;cursor:pointer;}
.member-card{animation:popIn .2s ease both;}
.reply-area{animation:slideOpen .22s ease both;}
.detail-panel{animation:slideInRight .28s ease both;}
@keyframes pgIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes arrowFade{0%,100%{opacity:0;transform:translateX(-3px) rotate(-45deg);}50%{opacity:0.7;transform:translateX(2px) rotate(-45deg);}}
@keyframes bamShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes bamFadeOut{0%,70%{opacity:1}100%{opacity:0}}
@keyframes cardRadiate{0%,100%{box-shadow:0 4px 20px rgba(0,0,0,0.18),0 0 0 0 rgba(226,221,159,0);}50%{box-shadow:0 4px 20px rgba(0,0,0,0.18),0 0 0 7px rgba(226,221,159,0.07),0 0 0 14px rgba(226,221,159,0.03);}}
.navCard{transition:transform 0.25s cubic-bezier(.34,1.56,.64,1);}
.navCard:hover{transform:scale(1.04);}
@keyframes lpop{0%{transform:scale(1);}45%{transform:scale(1.55);}72%{transform:scale(.9);}100%{transform:scale(1);}}
@keyframes slideD{from{transform:translateY(-110%) translateX(-50%);opacity:0;}to{transform:translateY(0) translateX(-50%);opacity:1;}}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
@keyframes ptsIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
@keyframes composePulse{0%,100%{box-shadow:0 0 0 0 rgba(226,221,159,0);}50%{box-shadow:0 0 0 4px rgba(226,221,159,0.12);}}
@keyframes popIn{from{opacity:0;transform:scale(.92) translateY(6px);}to{opacity:1;transform:scale(1) translateY(0);}}
@keyframes slideOpen{from{opacity:0;max-height:0;}to{opacity:1;max-height:400px;}}
@keyframes slideInRight{from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:translateX(0);}}
.pts{animation:ptsIn .5s ease both;}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes profileIn{from{transform:translateX(100%);}to{transform:translateX(0);}}
@keyframes globeSpin{from{transform:rotateY(0deg) rotateX(15deg);}to{transform:rotateY(360deg) rotateX(15deg);}}
@keyframes globeFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{border-radius:2px;background:#444;}
@keyframes pinDrop{0%{transform:translateY(-20px) scale(0.4);opacity:0;}70%{transform:translateY(3px) scale(1.15);}100%{transform:translateY(0) scale(1);opacity:1;}}
@keyframes pinPing{0%{transform:scale(1);opacity:.7;}100%{transform:scale(2.8);opacity:0;}}
@keyframes mapFadeIn{from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);}}
@keyframes livePulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.7;transform:scale(1.05);}}
.map-pin:hover .pin-label{opacity:1!important;transform:translateY(0)!important;}
@keyframes microDrop{0%{opacity:0;transform:scale(0.3) translateY(-18px);}60%{opacity:1;transform:scale(1.18) translateY(2px);}80%{transform:scale(0.94) translateY(0);}100%{opacity:1;transform:scale(1) translateY(0);}}
@keyframes ringPulse{0%{transform:scale(0.6);opacity:.7;}100%{transform:scale(3.2);opacity:0;}}
@keyframes dashFadeUp{0%{opacity:0;transform:translateY(22px);}100%{opacity:1;transform:translateY(0);}}
@keyframes introFade{0%{opacity:1;}85%{opacity:1;}100%{opacity:0;}}
.dash-intro-item{opacity:0;animation:dashFadeUp .55s ease forwards;}
@keyframes slideR{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
.profile-row:hover{background:rgba(226,221,159,0.07)!important;box-shadow:inset 0 0 0 1px rgba(226,221,159,0.18);}
.profile-row:hover svg{stroke:rgba(226,221,159,0.7)!important;}
@keyframes pulseMicro{0%,100%{opacity:.55;transform:scale(0.92);}50%{opacity:1;transform:scale(1.06);}}
.micro-pulse{animation:pulseMicro 1.6s ease-in-out infinite;}
.pp-block{transition:transform .2s ease,box-shadow .2s ease,margin .25s ease,opacity .2s ease;}
.pp-block:hover{transform:scale(1.008);}
.pp-block.dragging{opacity:.35;transform:scale(.96);}
.pp-drop-zone{transition:height .25s ease,opacity .25s ease;overflow:hidden;}
.pp-drill-item{transition:transform .15s ease,box-shadow .15s ease,opacity .15s ease;}
.pp-drill-item:hover{transform:scale(1.01);}
.pp-drill-item.dragging{opacity:.3;transform:scale(.95);}
@media(max-width:700px){
  .bam-dash-cards{grid-template-columns:repeat(2,1fr)!important;}
  .bam-dash-bottom{grid-template-columns:1fr!important;}
  .bam-dash-bottom>div:last-child{order:-1;}
  .bam-dash-grid{grid-template-columns:1fr!important;}
  .bam-settings-row{min-height:44px!important;}
}
@media(max-width:480px){
  .bam-dash-cards{grid-template-columns:1fr!important;}
}
`;

// ── MINI ICONS ──────────────────────────────────────────────────────────────
const Ic = {
  Search:({c,s=13})=>(<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke={c} strokeWidth="1.5"/><path d="M10 10L14 14" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>),
  Bell:({c,s=15,dot})=>(<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4 4 0 0 0 4 5.5c0 4.5-2 5.5-2 5.5h12s-2-1-2-5.5A4 4 0 0 0 8 1.5z" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M9.5 12.5a1.5 1.5 0 0 1-3 0" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>{dot&&<circle cx="12.5" cy="3.5" r="2.5" fill="#C47878"/>}</svg>),
  IG:({c,s=12})=>(<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5.5" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="12" r="4.2" stroke={c} strokeWidth="1.8"/><circle cx="17.5" cy="6.5" r="1.1" fill={c}/></svg>),
  TW:({c,s=11})=>(<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  Heart:({c,s=14,f})=>(<svg width={s} height={s} viewBox="0 0 16 16" fill={f?c:"none"}><path d="M8 13.5S2 9.5 2 5.5A3.5 3.5 0 0 1 8 3.8 3.5 3.5 0 0 1 14 5.5c0 4-6 8-6 8z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>),
  Msg:({c,s=13})=>(<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 2.5h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 2.5V3.5a1 1 0 0 1 1-1z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>),
  Spin:({c,s=12})=>(<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.9 4.4 2.2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M11 5h2.5V2.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Trophy:({c,s=13})=>(<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 11c-2.2 0-4-1.8-4-4V2h8v5c0 2.2-1.8 4-4 4z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M4 4H2a2 2 0 0 0 2 2M12 4h2a2 2 0 0 1-2 2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M8 11v3M5.5 14h5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  Close:({c,s=12})=>(<svg width={s} height={s} viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>),
  Send:({c,s=13})=>(<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7l5 2 2 5 5-12z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>),
};

// ── CONTENT CARD ────────────────────────────────────────────────────────────
function ContentCard({item, sectionId, C, dark, onClick, favDrills=[], toggleFav, masterProgress}){
  const thumbColors = SECTION_COLORS[sectionId] || SECTION_COLORS.pd;
  const thumbColor = thumbColors[item.id % thumbColors.length];
  const isFav = favDrills.some(f=>f.key===`${sectionId}-${item.id}`);
  const [thumbErr,setThumbErr]=useState(false);
  const [vidLoading,setVidLoading]=useState(true);
  // Prompt 4: NEW badge only for items added within 2 days
  const isRecentlyNew = item.isNew && item.date_added && (Date.now()-new Date(item.date_added).getTime()<2*86400000);
  const showNew = item.isNew && !item.date_added || isRecentlyNew; // fallback: show if no date_added field
  // Prompt 8: masterclass progress bar
  const mProg = sectionId==="master" && masterProgress ? masterProgress[`master-${item.id}`] : null;
  return (
    <div className="cc" onClick={()=>onClick(item)}
      style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:dark?"none":`0 2px 8px ${C.shadow}`,"--hs":`0 8px 28px ${C.shadow}`,position:"relative"}}>
      {/* Thumbnail */}
      <div style={{height:130,background:thumbErr?"#1A1A1A":thumbColor,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",
        border:thumbErr?`1px solid ${GOLD}30`:"none"}}>
        {thumbErr?(
          <img src={LOGO} alt="BAM" className="micro-pulse" style={{width:36,height:42,objectFit:"contain",opacity:.5,filter:`drop-shadow(0 0 8px ${GOLD}33)`}}/>
        ):(
          <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
            <Play size={18} color="#fff" fill="#fff"/>
          </div>
        )}
        {showNew&&<div style={{position:"absolute",top:10,left:10,fontSize:9,fontWeight:800,color:"#1A1A1A",background:GOLD,padding:"3px 8px",borderRadius:4,letterSpacing:.8}}>NEW</div>}
        <div onClick={e=>{e.stopPropagation();toggleFav&&toggleFav(item,sectionId);}}
          style={{position:"absolute",top:8,right:9,width:28,height:28,borderRadius:"50%",
            background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",
            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
            transition:"transform .15s",zIndex:2}}
          className="btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav?GOLD:"none"}
            stroke={isFav?GOLD:"#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div style={{position:"absolute",bottom:8,right:10,display:"flex",alignItems:"center",gap:4,background:"rgba(0,0,0,0.5)",borderRadius:5,padding:"3px 8px"}}>
          <Clock size={10} color="#fff"/>
          <span style={{fontSize:10,color:"#fff",fontWeight:600}}>{item.duration}</span>
        </div>
      </div>
      {/* Info */}
      <div style={{padding:"13px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
          <div style={{fontSize:9,fontWeight:700,color:"#111",background:GOLD,padding:"2px 8px",borderRadius:10,letterSpacing:.5}}>{item.tag}</div>
          <div style={{fontSize:10,color:C.textDim,fontWeight:500}}>{item.level}</div>
        </div>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4,lineHeight:1.3,
          display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.title}</div>
        <div style={{fontSize:12,color:C.textDim,marginBottom:10}}>{item.sub}</div>
      </div>
      {/* Prompt 8: masterclass progress bar */}
      {mProg>0&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:C.border}}>
        <div style={{height:"100%",width:`${Math.min(mProg,100)}%`,background:GOLD,borderRadius:"0 2px 0 0",transition:"width .3s"}}/>
      </div>}
    </div>
  );
}

// ── CONTENT DETAIL PANEL ───────────────────────────────────────────────────
function ContentDetail({item, sectionId, C, dark, onClose, masterProgress, setMasterProgress, onWorkoutLeave}){
  const thumbColors = SECTION_COLORS[sectionId] || SECTION_COLORS.pd;
  const thumbColor = thumbColors[item.id % thumbColors.length];
  // Prompt 4: persist saved/liked state in localStorage
  const favKey = `bam_fav_${sectionId}_${item.id}`;
  const [saved, setSaved] = useState(()=>{try{return localStorage.getItem(favKey)==="1";}catch{return false;}});
  const toggleSaved=()=>{const nv=!saved;setSaved(nv);try{nv?localStorage.setItem(favKey,"1"):localStorage.removeItem(favKey);}catch{}};
  // Prompt 8: masterclass progress
  const mKey=`master-${item.id}`;
  const mProg=sectionId==="master"&&masterProgress?masterProgress[mKey]||0:0;
  const hasKeyPoints=item.keyPoints&&item.keyPoints.length>0;
  // Prompt 7: workout in-progress state
  const [workoutStarted,setWorkoutStarted]=useState(false);
  const [showWorkoutLeave,setShowWorkoutLeave]=useState(false);
  const handleClose=()=>{
    if(sectionId==="workouts"&&workoutStarted){setShowWorkoutLeave(true);return;}
    onClose();
  };
  // Mark masterclass as started when detail is opened
  useEffect(()=>{
    if(sectionId==="master"&&setMasterProgress&&mProg===0){
      setMasterProgress(prev=>{const n={...prev,[mKey]:10};try{localStorage.setItem("bam_master_progress",JSON.stringify(n));}catch{}return n;});
    }
  },[]);// eslint-disable-line
  return (
    <div className="detail-panel" style={{width:340,flexShrink:0,background:C.bgCard,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"auto"}}>
      {/* Prompt 8: masterclass progress bar at top */}
      {sectionId==="master"&&mProg>0&&(
        <div style={{height:3,background:C.border,flexShrink:0}}>
          <div style={{height:"100%",width:`${Math.min(mProg,100)}%`,background:GOLD,transition:"width .3s"}}/>
        </div>
      )}
      {/* Video thumb */}
      <div style={{height:180,background:thumbColor,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <div style={{width:54,height:54,borderRadius:"50%",background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <Play size={22} color="#fff" fill="#fff"/>
        </div>
        <button onClick={handleClose} style={{position:"absolute",top:12,right:12,width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <X size={13} color="#fff"/>
        </button>
      </div>

      {/* Prompt 7: Workout leave confirmation modal */}
      {showWorkoutLeave&&(
        <div onClick={e=>e.stopPropagation()} style={{position:"fixed",inset:0,zIndex:5000,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:dark?"#1A1A1A":"#fff",borderRadius:14,padding:"28px 32px",maxWidth:360,textAlign:"center",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:8}}>Leave this workout?</div>
            <div style={{fontSize:13,color:C.textDim,marginBottom:22,lineHeight:1.6}}>Your progress will be reset.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setShowWorkoutLeave(false)} style={{padding:"8px 24px",borderRadius:8,fontSize:13,fontWeight:700,background:GOLD,color:"#111",border:"none",cursor:"pointer"}}>Stay</button>
              <button onClick={()=>{setShowWorkoutLeave(false);setWorkoutStarted(false);onClose();}} style={{padding:"8px 24px",borderRadius:8,fontSize:13,fontWeight:700,background:"transparent",color:C.textMid,border:`1px solid ${C.border}`,cursor:"pointer"}}>Leave</button>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:20,flex:1}}>
        {/* Prompt 8: Continue where you left off */}
        {sectionId==="master"&&mProg>0&&mProg<100&&(
          <div className="btn" onClick={()=>{/* scroll to last section */}}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:`${GOLD}12`,border:`1px solid ${GOLD}30`,borderRadius:9,marginBottom:14,cursor:"pointer"}}>
            <Play size={13} color={GOLD} fill={GOLD}/>
            <span style={{fontSize:12,fontWeight:700,color:GOLD}}>Continue where you left off ({mProg}%)</span>
          </div>
        )}
        {/* Tags row */}
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#111",background:GOLD,padding:"3px 9px",borderRadius:10,letterSpacing:.4}}>{item.tag}</div>
          <div style={{fontSize:11,color:C.textDim}}>{item.level}</div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:"auto",fontSize:11,color:C.textDim}}>
            <Clock size={11} color={C.textDim}/>{item.duration}
          </div>
        </div>

        {/* Title */}
        <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:4,lineHeight:1.3}}>{item.title}</div>
        <div style={{fontSize:12,color:C.textDim,marginBottom:14}}>{item.sub}</div>

        {/* Description */}
        <div style={{fontSize:13,color:C.textMid,lineHeight:1.7,marginBottom:16}}>{item.desc}</div>

        {/* Key points — Prompt 4: hide if empty */}
        {hasKeyPoints&&(
          <>
            <div style={{fontSize:12,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Key Points</div>
            {item.keyPoints.map((pt,i)=>(
              <div key={i} style={{display:"flex",gap:9,alignItems:"flex-start",marginBottom:8}}>
                <CheckCircle size={13} color={GOLD} style={{flexShrink:0,marginTop:2}}/>
                <div style={{fontSize:13,color:C.textMid,lineHeight:1.55}}>{pt}</div>
              </div>
            ))}
          </>
        )}

        {/* Actions */}
        <div style={{display:"flex",gap:9,marginTop:20}}>
          <div className="btn" onClick={()=>{if(sectionId==="workouts")setWorkoutStarted(true);}} style={{flex:1,background:GOLD,color:"#111",fontWeight:800,fontSize:13,padding:"11px 0",borderRadius:9,textAlign:"center",boxShadow:`0 4px 14px ${GOLD}44`}}>
            {sectionId==="workouts"&&workoutStarted?"In Progress...":"Watch Now"}
          </div>
          <div className="btn" onClick={toggleSaved} style={{width:42,height:42,borderRadius:9,border:`1px solid ${saved?GOLD:C.border}`,background:saved?C.goldDim:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ic.Heart c={saved?GOLD:C.textDim} f={saved} s={17}/>
          </div>
          <div className="btn" style={{width:42,height:42,borderRadius:9,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Share2 size={15} color={C.textDim}/>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── PRACTICE PLANS PAGE ───────────────────────────────────────────────────

const BLOCK_CATEGORIES = [
  { id:"warmup",        label:"Warmup / Movement",   color:"#5B7FA6", icon:"warmup",     contentTags:["All"], subs:[] },
  { id:"pd",            label:"Player Development",   color:"#6B9E7A", icon:"pd",         contentTags:[], subs:[
    { id:"pd-handles",    label:"Ballhandling Work",    contentSections:["pd"], contentTags:["Handles"] },
    { id:"pd-shooting",   label:"Shooting Training",    contentSections:["pd"], contentTags:["Shooting","Finishing"] },
    { id:"pd-iq",         label:"IQ Building & Passing",contentSections:["pd","insights"], contentTags:["1v1","Decision"] },
    { id:"pd-defense",    label:"Defensive Work",       contentSections:["pd"], contentTags:["Defense"] },
    { id:"pd-pdp",        label:"Play-Drill-Play",      contentSections:["pd","team"], contentTags:["Competitive","All"], isPDP:true },
    { id:"pd-general",    label:"General Player Dev",   contentSections:["pd"], contentTags:["All"] },
  ]},
  { id:"team-block",     label:"Team Block",           color:"#9E6B7A", icon:"team",       contentTags:[], subs:[
    { id:"team-transition",label:"Transition",           contentSections:["team"], contentTags:["Transition"] },
    { id:"team-hco",      label:"Half-Court Offense",    contentSections:["team","xo"], contentTags:["Offense","Sets","Half Court"] },
    { id:"team-scrimmage", label:"Scrimmage",            contentSections:["team"], contentTags:["5v5","Competitive"] },
    { id:"team-ssg",      label:"Decision-Making SSGs",  contentSections:["team"], contentTags:["Competitive","All"] },
    { id:"team-defense",  label:"Defense",               contentSections:["team"], contentTags:["Defense"] },
  ]},
  { id:"conditioning",   label:"Conditioning",         color:"#9E7A5B", icon:"conditioning",contentTags:["All"], subs:[] },
  { id:"film",           label:"Film",                 color:"#6B7A9E", icon:"film",       contentTags:["All"], subs:[] },
  { id:"cooldown",       label:"Cool Down",            color:"#7A9E7A", icon:"cooldown",   contentTags:["All"], subs:[] },
  { id:"custom",         label:"Custom Block",         color:"#888888", icon:"custom",     contentTags:["All"], subs:[], isCustom:true },
];

const BLOCK_ICON_MAP = {
  warmup: (c,s)=><Target size={s} color={c}/>,
  pd: (c,s)=><Zap size={s} color={c}/>,
  team: (c,s)=><Users size={s} color={c}/>,
  conditioning: (c,s)=><Clock size={s} color={c}/>,
  film: (c,s)=><Play size={s} color={c}/>,
  cooldown: (c,s)=><ChevronDown size={s} color={c}/>,
  custom: (c,s)=><Type size={s} color={c}/>,
};

const DURATION_PRESETS = [5,10,15,20,25,30];

// Flatten all drills from content library for search
const ALL_DRILLS = Object.entries(CONTENT).flatMap(([section, data]) =>
  (data.items || []).map(item => ({ ...item, section, sectionLabel: data.title }))
);

// Find the parent category and sub-type for a block type id
function findBlockMeta(typeId) {
  for (const cat of BLOCK_CATEGORIES) {
    if (cat.id === typeId) return { category: cat, sub: null };
    const sub = cat.subs.find(s => s.id === typeId);
    if (sub) return { category: cat, sub };
  }
  return { category: BLOCK_CATEGORIES[0], sub: null };
}

// Filter drills relevant to a block type
function getDrillsForBlock(typeId) {
  const { category, sub } = findBlockMeta(typeId);
  if (sub) {
    const sections = sub.contentSections || [];
    const tags = sub.contentTags || [];
    return ALL_DRILLS.filter(d => {
      if (sections.length > 0 && !sections.includes(d.section)) return false;
      if (tags.includes("All")) return true;
      return tags.some(t => d.tag?.includes(t) || d.title?.toLowerCase().includes(t.toLowerCase()));
    });
  }
  return ALL_DRILLS;
}

const PLAN_TEMPLATES = {
  "60min": [
    { type:"warmup",      duration:10, notes:"Activate players physically and mentally" },
    { type:"pd-shooting", duration:15, notes:"Build catch-and-shoot confidence" },
    { type:"pd-general",  duration:15, notes:"Develop finishing under contact" },
    { type:"team-ssg",    duration:15, notes:"Apply reads in live reps" },
    { type:"film",        duration:5,  notes:"Reinforce key coaching points" },
  ],
  "90min": [
    { type:"warmup",       duration:15, notes:"Position-specific activation" },
    { type:"pd-shooting",  duration:20, notes:"Shooting off movement" },
    { type:"team-defense", duration:20, notes:"Build team defensive habits" },
    { type:"team-hco",     duration:20, notes:"Install one offensive action" },
    { type:"team-scrimmage",duration:10,notes:"5v5 with coaching overlay" },
    { type:"film",         duration:5,  notes:"Debrief and reinforce" },
  ],
  "blank": [],
};

let blockIdCounter = 100;
const newBlock = (typeId, overrides = {}) => {
  const { sub } = findBlockMeta(typeId);
  const base = {
    id: ++blockIdCounter,
    type: typeId,
    customName: "",
    duration: 10,
    notes: "",
    drills: [],
  };
  // PDP blocks get structured slots instead of a flat drills array
  if (sub?.isPDP) {
    base.pdpSlots = { game1: null, drill: null, game2: null };
  }
  return { ...base, ...overrides };
};

// ── DRILL SEARCH PANEL (right column) ──────────────────────────────────────
function DrillSearchPanel({ block, C, dark, onAddDrill, onRemoveDrill, pdpSlot, pdpSlotLabel }) {
  const { category, sub } = findBlockMeta(block.type);
  const [search, setSearch] = useState("");
  const color = category.color;
  const label = pdpSlotLabel || (sub ? sub.label : category.label);
  const isPDP = sub?.isPDP && pdpSlot;

  // For PDP slots, filter differently: game slots get competitive/game content, drill slot gets skill content
  const relevantDrills = (() => {
    if (isPDP) {
      if (pdpSlot === "drill") {
        return ALL_DRILLS.filter(d => d.section === "pd" || d.section === "insights");
      }
      // game1 / game2 — competitive games, SSGs, team drills
      return ALL_DRILLS.filter(d => d.section === "team" || d.tag === "Competitive" || d.tag === "1v1" || d.sub?.includes("Game"));
    }
    return getDrillsForBlock(block.type);
  })();

  const filtered = relevantDrills.filter(d => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.tag?.toLowerCase().includes(q) || d.desc?.toLowerCase().includes(q);
  }).slice(0, 20);

  // Check if drill is already in this block (or this PDP slot)
  const isDrillAdded = (drill) => {
    if (isPDP) {
      const slotDrill = block.pdpSlots?.[pdpSlot];
      return slotDrill && slotDrill.id === drill.id && slotDrill.section === drill.section;
    }
    return block.drills.some(d => d.id === drill.id && d.section === drill.section);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header */}
      <div style={{ padding:"16px 18px 12px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:color+"25", border:`1px solid ${color}50`,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            {(BLOCK_ICON_MAP[category.icon] || BLOCK_ICON_MAP.custom)(color, 14)}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{label}</div>
            <div style={{ fontSize:10, color:C.textDim }}>{relevantDrills.length} matching drills</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8,
          background:C.bgHover, borderRadius:8, border:`1px solid ${C.border}`, padding:"7px 12px" }}>
          <Filter size={12} color={C.textDim}/>
          <input value={search} onChange={e => { setSearch(e.target.value); if(e.target.value.trim()) logEvent("search",{term:e.target.value.trim()}); }}
            placeholder="Search drills..."
            style={{ flex:1, background:"transparent", border:"none", outline:"none",
              fontSize:13, color:C.text, fontFamily:"'DM Sans',sans-serif" }}/>
          {search && <div className="btn" onClick={() => setSearch("")}><X size={11} color={C.textDim}/></div>}
        </div>
      </div>

      {/* Drill list */}
      <div style={{ flex:1, overflowY:"auto", padding:"8px 14px 14px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 0", color:C.textDim }}>
            <img src={BAM_LOGO_PNG} alt="BAM" style={{width:36,height:36,objectFit:"contain",opacity:.35,marginBottom:12}} />
            <div style={{fontSize:13}}>No drills found — try a different search.</div>
          </div>
        )}
        {filtered.map(drill => {
          const alreadyAdded = isDrillAdded(drill);
          const thumbColor = (SECTION_COLORS[drill.section] || SECTION_COLORS.pd)[drill.id % 8];
          return (
            <div key={`${drill.section}-${drill.id}`} style={{
              display:"flex", gap:10, alignItems:"center",
              padding:"10px 11px", borderRadius:9, marginBottom:6,
              background: alreadyAdded ? (dark?"rgba(226,221,159,0.08)":"rgba(226,221,159,0.15)") : C.bgHover,
              border:`1px solid ${alreadyAdded ? GOLD+"50" : C.border}`,
              cursor:"pointer", transition:"all .15s",
            }} onClick={() => alreadyAdded ? onRemoveDrill(drill) : onAddDrill(drill)}>
              <div style={{ width:40, height:40, borderRadius:7, background:thumbColor,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Play size={12} color="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.8)"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{drill.title}</div>
                <div style={{ fontSize:10, color:C.textDim }}>
                  {drill.sectionLabel} · {drill.tag} · {drill.duration}
                  {drill.level && <span> · {drill.level}</span>}
                </div>
              </div>
              <div style={{ flexShrink:0, width:26, height:26, borderRadius:7,
                background: alreadyAdded ? GOLD : "transparent",
                border:`1px solid ${alreadyAdded ? GOLD : C.border}`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {alreadyAdded
                  ? <CheckCircle size={13} color="#111"/>
                  : <Plus size={13} color={C.textDim}/>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PracticePlansPage({ C, dark }) {
  const [blocks, setBlocks] = useState([]);
  const [planName, setPlanName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [activePdpSlot, setActivePdpSlot] = useState(null); // "game1" | "drill" | "game2" | null
  const [savedPlans, setSavedPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bam_saved_plans") || "[]"); } catch { return []; }
  });
  const [expandedCat, setExpandedCat] = useState(null);
  const [customBlockName, setCustomBlockName] = useState("");
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  // Palette drag state
  const [paletteDrag, setPaletteDrag] = useState(null); // typeId being dragged from palette
  const [canvasDropIdx, setCanvasDropIdx] = useState(null);
  // Drill drag state
  const [drillDrag, setDrillDrag] = useState(null);
  const [drillDropTarget, setDrillDropTarget] = useState(null);
  // Prompt 1: block limit message
  const [blockLimitMsg, setBlockLimitMsg] = useState("");
  // Prompt 5: auto-save
  const [autoSaveMsg, setAutoSaveMsg] = useState("");
  const [draftBanner, setDraftBanner] = useState(()=>{try{const d=localStorage.getItem("bam_plan_draft");return d?true:false;}catch{return false;}});
  // Prompt 6: duplicate name warning
  const [nameExistsWarn, setNameExistsWarn] = useState("");
  // Prompt 6: plan limit warning
  const [planLimitMsg, setPlanLimitMsg] = useState("");
  // Prompt 7: delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  // Prompt 2: custom block validation
  const [customBlockErrors, setCustomBlockErrors] = useState({});
  // Prompt 3: duplicate drill toast
  const [drillToast, setDrillToast] = useState("");

  const totalMins = blocks.reduce((s, b) => s + (b.duration || 0), 0);

  const loadTemplate = (key) => {
    const tpl = PLAN_TEMPLATES[key];
    setBlocks(tpl.map(b => newBlock(b.type, { duration: b.duration, notes: b.notes || "" })));
    setPlanName(key === "60min" ? "60-Min Skill Session" : key === "90min" ? "90-Min Team Practice" : "");
    setSaved(false);
    setActiveBlockId(null);
    setActivePdpSlot(null);
  };

  const MAX_BLOCKS = 15;
  const insertBlockAt = (typeId, idx, customName) => {
    if (blocks.length >= MAX_BLOCKS) {
      setBlockLimitMsg("Maximum 15 blocks per plan");
      setTimeout(()=>setBlockLimitMsg(""),3000);
      return null;
    }
    const b = newBlock(typeId, customName ? { customName } : {});
    setBlocks(prev => { const a = [...prev]; a.splice(idx, 0, b); return a; });
    setActiveBlockId(b.id);
    setActivePdpSlot(null);
    setSaved(false);
    setBlockLimitMsg("");
    return b;
  };

  const addBlock = (typeId, customName) => {
    if (blocks.length >= MAX_BLOCKS) {
      setBlockLimitMsg("Maximum 15 blocks per plan");
      setTimeout(()=>setBlockLimitMsg(""),3000);
      return;
    }
    const b = newBlock(typeId, customName ? { customName } : {});
    setBlocks(prev => [...prev, b]);
    setActiveBlockId(b.id);
    setActivePdpSlot(null);
    setSaved(false);
    setBlockLimitMsg("");
  };

  const removeBlock = (id) => {
    setBlocks(b => b.filter(x => x.id !== id));
    if (activeBlockId === id) { setActiveBlockId(null); setActivePdpSlot(null); }
    setSaved(false);
  };

  const updateBlock = (id, field, val) => {
    setBlocks(b => b.map(x => x.id === id ? { ...x, [field]: val } : x));
    setSaved(false);
  };

  // PDP slot handlers
  const setPdpSlotDrill = (blockId, slot, drill) => {
    setBlocks(b => b.map(x => x.id === blockId
      ? { ...x, pdpSlots: { ...x.pdpSlots, [slot]: drill ? { ...drill, drillNotes: "" } : null } }
      : x));
    setSaved(false);
  };
  const clearPdpSlot = (blockId, slot) => {
    setPdpSlotDrill(blockId, slot, null);
  };

  // Regular drill handlers — Prompt 3: allow duplicates with warning toast
  const addDrillToBlock = (blockId, drill) => {
    const block = blocks.find(b=>b.id===blockId);
    if(block && block.drills.some(d=>d.id===drill.id && d.section===drill.section)){
      setDrillToast("This drill is already in this block");
      setTimeout(()=>setDrillToast(""),2500);
    }
    setBlocks(b => b.map(x => x.id === blockId
      ? { ...x, drills: [...x.drills, { ...drill, drillNotes: "" }] }
      : x));
    setSaved(false);
  };
  const removeDrillFromBlock = (blockId, drill) => {
    setBlocks(b => b.map(x => x.id === blockId
      ? { ...x, drills: x.drills.filter(d => !(d.id === drill.id && d.section === drill.section)) }
      : x));
    setSaved(false);
  };
  const updateDrillNotes = (blockId, drillIdx, notes) => {
    setBlocks(b => b.map(x => x.id === blockId
      ? { ...x, drills: x.drills.map((d,i) => i === drillIdx ? { ...d, drillNotes: notes } : d) }
      : x));
    setSaved(false);
  };

  // Block drag handlers (reorder on canvas)
  const onBlockDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "block-reorder");
  };
  const onCanvasDragOver = (e, idx) => {
    e.preventDefault();
    // Accept both palette drags and block reorder drags
    if (dragIdx !== null) setDropIdx(idx);
    if (paletteDrag) setCanvasDropIdx(idx);
  };
  const onCanvasDrop = (e, idx) => {
    e.preventDefault();
    // Palette drag → insert new block
    if (paletteDrag) {
      insertBlockAt(paletteDrag, idx);
      setPaletteDrag(null);
      setCanvasDropIdx(null);
      return;
    }
    // Block reorder
    if (dragIdx !== null && dragIdx !== idx) {
      const arr = [...blocks];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(idx > dragIdx ? idx - 1 : idx, 0, moved);
      setBlocks(arr);
    }
    setDragIdx(null); setDropIdx(null); setSaved(false);
  };
  const onBlockDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  // Palette drag handlers
  const onPaletteDragStart = (e, typeId) => {
    setPaletteDrag(typeId);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", "palette-block");
  };
  const onPaletteDragEnd = () => { setPaletteDrag(null); setCanvasDropIdx(null); };

  // Drill drag handlers (within and between blocks)
  const onDrillDragStart = (e, blockId, drillIdx) => {
    e.stopPropagation();
    setDrillDrag({ blockId, drillIdx });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "drill");
  };
  const onDrillDragOver = (e, blockId, drillIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drillDrag) return;
    setDrillDropTarget({ blockId, drillIdx });
  };
  const onDrillDrop = (e, targetBlockId, targetDrillIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drillDrag) return;
    const { blockId: srcBlockId, drillIdx: srcDrillIdx } = drillDrag;

    setBlocks(prev => {
      const next = prev.map(b => ({ ...b, drills: [...b.drills] }));
      const srcBlock = next.find(b => b.id === srcBlockId);
      const tgtBlock = next.find(b => b.id === targetBlockId);
      if (!srcBlock || !tgtBlock) return prev;

      const [movedDrill] = srcBlock.drills.splice(srcDrillIdx, 1);
      if (srcBlockId === targetBlockId && targetDrillIdx > srcDrillIdx) {
        tgtBlock.drills.splice(targetDrillIdx - 1, 0, movedDrill);
      } else {
        tgtBlock.drills.splice(targetDrillIdx, 0, movedDrill);
      }
      return next;
    });

    setDrillDrag(null);
    setDrillDropTarget(null);
    setSaved(false);
  };
  const onDrillDragEnd = () => { setDrillDrag(null); setDrillDropTarget(null); };

  const [namePromptVisible, setNamePromptVisible] = useState(false);
  const planNameRef = useRef(null);

  // Save plan — with validations
  const savePlan = () => {
    if (blocks.length === 0) return;
    if (!planName.trim()) {
      setNamePromptVisible(true);
      setEditingName(true);
      setTimeout(()=>planNameRef.current?.focus(),50);
      return;
    }
    // Prompt 2: validate custom block names
    const errs = {};
    blocks.forEach(b=>{
      const{category}=findBlockMeta(b.type);
      if(category.isCustom && !b.customName.trim()) errs[b.id]="Please name this block";
    });
    if(Object.keys(errs).length>0){setCustomBlockErrors(errs);return;}
    setCustomBlockErrors({});

    setNamePromptVisible(false);
    const name = planName.trim();

    // Prompt 6: duplicate name check
    if(savedPlans.some(p=>p.name.toLowerCase()===name.toLowerCase())){
      setNameExistsWarn("A plan with this name already exists — choose a different name");
      setEditingName(true);
      setTimeout(()=>planNameRef.current?.focus(),50);
      return;
    }
    setNameExistsWarn("");

    // Prompt 6: plan cap
    if(savedPlans.length>=50){
      setPlanLimitMsg("You've reached the maximum of 50 saved plans. Delete a plan to save a new one.");
      setTimeout(()=>setPlanLimitMsg(""),5000);
      return;
    }

    const plan = {
      id: Date.now(),
      name,
      blocks: blocks.map(b => ({
        type: b.type, customName: b.customName, duration: b.duration, notes: b.notes,
        drills: b.drills.map(d => ({ id:d.id, section:d.section, title:d.title, drillNotes:d.drillNotes||"" })),
        pdpSlots: b.pdpSlots ? {
          game1: b.pdpSlots.game1 ? { id:b.pdpSlots.game1.id, section:b.pdpSlots.game1.section, title:b.pdpSlots.game1.title } : null,
          drill: b.pdpSlots.drill ? { id:b.pdpSlots.drill.id, section:b.pdpSlots.drill.section, title:b.pdpSlots.drill.title } : null,
          game2: b.pdpSlots.game2 ? { id:b.pdpSlots.game2.id, section:b.pdpSlots.game2.section, title:b.pdpSlots.game2.title } : null,
        } : undefined,
      })),
      totalMins,
      createdAt: new Date().toISOString(),
    };
    const updated = [plan, ...savedPlans];
    setSavedPlans(updated);
    try { localStorage.setItem("bam_saved_plans", JSON.stringify(updated)); } catch {}
    // Clear auto-save draft on successful save
    try { localStorage.removeItem("bam_plan_draft"); } catch {}
    setDraftBanner(false);
    setPlanName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Load saved plan
  const loadSavedPlan = (plan) => {
    setPlanName(plan.name);
    setBlocks(plan.blocks.map(b => {
      const block = newBlock(b.type, { customName: b.customName || "", duration: b.duration, notes: b.notes || "" });
      block.drills = (b.drills || []).map(d => {
        const full = ALL_DRILLS.find(ad => ad.id === d.id && ad.section === d.section);
        return full ? { ...full, drillNotes: d.drillNotes || "" } : { id:d.id, section:d.section, title:d.title, drillNotes:d.drillNotes||"" };
      });
      if (b.pdpSlots) {
        block.pdpSlots = {};
        ["game1","drill","game2"].forEach(slot => {
          if (b.pdpSlots[slot]) {
            const full = ALL_DRILLS.find(ad => ad.id === b.pdpSlots[slot].id && ad.section === b.pdpSlots[slot].section);
            block.pdpSlots[slot] = full ? { ...full, drillNotes: "" } : b.pdpSlots[slot];
          } else {
            block.pdpSlots[slot] = null;
          }
        });
      }
      return block;
    }));
    setActiveBlockId(null);
    setActivePdpSlot(null);
    setSaved(true);
  };

  const doDeleteSavedPlan = (id) => {
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    try { localStorage.setItem("bam_saved_plans", JSON.stringify(updated)); } catch {}
    setDeleteConfirm(null);
  };

  // Prompt 5: auto-save every 60 seconds
  useEffect(()=>{
    if(blocks.length===0) return;
    const iv=setInterval(()=>{
      try{
        localStorage.setItem("bam_plan_draft",JSON.stringify({planName,blocks,ts:Date.now()}));
        setAutoSaveMsg("Auto-saved");
        setTimeout(()=>setAutoSaveMsg(""),2000);
      }catch{}
    },60000);
    return ()=>clearInterval(iv);
  },[blocks,planName]);

  // Prompt 5: resume draft
  const resumeDraft = () => {
    try{
      const d=JSON.parse(localStorage.getItem("bam_plan_draft")||"null");
      if(d){
        setPlanName(d.planName||"");
        setBlocks((d.blocks||[]).map(b=>{
          const block=newBlock(b.type,{customName:b.customName||"",duration:b.duration,notes:b.notes||""});
          block.drills=(b.drills||[]).map(dr=>{
            const full=ALL_DRILLS.find(ad=>ad.id===dr.id&&ad.section===dr.section);
            return full?{...full,drillNotes:dr.drillNotes||""}:{...dr,drillNotes:dr.drillNotes||""};
          });
          if(b.pdpSlots){
            block.pdpSlots={};
            ["game1","drill","game2"].forEach(slot=>{
              if(b.pdpSlots[slot]){
                const full=ALL_DRILLS.find(ad=>ad.id===b.pdpSlots[slot].id&&ad.section===b.pdpSlots[slot].section);
                block.pdpSlots[slot]=full?{...full}:b.pdpSlots[slot];
              }else block.pdpSlots[slot]=null;
            });
          }
          return block;
        }));
      }
    }catch{}
    setDraftBanner(false);
  };
  const discardDraft = () => {
    try{localStorage.removeItem("bam_plan_draft");}catch{}
    setDraftBanner(false);
  };

  // Export PDF — Prompt 8: branded dark theme
  const exportPDF = () => {
    if (blocks.length === 0) return;
    const name = planName.trim() || "Practice Plan";
    const pageHeader = `<div class="page-header"><img src="${BAM_LOGO_PNG}" class="logo"/><span class="plan-title">${name}</span></div>`;
    let html = `<html><head><title>${name}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
      *{box-sizing:border-box;}
      body{font-family:'DM Sans',sans-serif;max-width:700px;margin:0 auto;color:#F2F2F2;padding:0 20px;background:#0D0D0D;}
      .page-header{display:flex;align-items:center;gap:12px;padding:20px 0 16px;border-bottom:2px solid #E2DD9F;margin-bottom:20px;}
      .page-header .logo{width:32px;height:32px;object-fit:contain;}
      .page-header .plan-title{font-family:'Bebas Neue',sans-serif;font-size:24px;color:#E2DD9F;letter-spacing:2px;}
      .meta{font-size:13px;color:#888;margin-bottom:24px;}
      .block{margin-bottom:16px;border:1px solid #2A2A2A;border-radius:10px;overflow:hidden;background:#1A1A1A;}
      .block-header{padding:12px 16px;background:#222;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2A2A2A;}
      .block-header .type{font-weight:700;font-size:14px;color:#F2F2F2;}
      .block-header .dur{font-size:12px;color:#E2DD9F;font-weight:600;}
      .block-notes{padding:8px 16px;font-size:12px;color:#888;font-style:italic;border-bottom:1px solid #2A2A2A;}
      .drill{padding:8px 16px;font-size:13px;border-bottom:1px solid #222;color:#F2F2F2;}
      .drill:last-child{border-bottom:none;}
      .drill-title{font-weight:600;}
      .drill-notes{font-size:11px;color:#888;margin-top:2px;font-style:italic;}
      .drill-empty{padding:8px 16px;font-size:13px;color:#666;font-style:italic;}
      .pdp-slot{padding:10px 16px;border-bottom:1px solid #222;}
      .pdp-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#E2DD9F;margin-bottom:4px;}
      .pdp-empty{color:#666;font-style:italic;}
      .page-footer{text-align:center;font-size:10px;color:#666;padding:16px 0;border-top:1px solid #2A2A2A;margin-top:20px;}
      @media print{body{margin:20px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
      @page{margin:15mm;}
    </style></head><body>`;
    html += pageHeader;
    html += `<div class="meta">${totalMins} minutes | ${blocks.length} blocks</div>`;
    let cumMins = 0;
    blocks.forEach((b,bi) => {
      const { category, sub } = findBlockMeta(b.type);
      const blockLabel = b.customName || (sub ? sub.label : category.label);
      const dur = b.duration || 0;
      const durLabel = dur > 0 ? `${cumMins}-${cumMins+dur} min (${dur} min)` : "N/A";
      html += `<div class="block">`;
      html += `<div class="block-header"><span class="type">${blockLabel}</span><span class="dur">${durLabel}</span></div>`;
      if (b.notes) html += `<div class="block-notes">${b.notes}</div>`;
      if (b.pdpSlots) {
        [["game1","Game 1"],["drill","Drill"],["game2","Game 2"]].forEach(([key,lbl]) => {
          const sd = b.pdpSlots[key];
          html += `<div class="pdp-slot"><div class="pdp-label">${lbl}</div>`;
          html += sd ? `<div class="drill-title">${sd.title}</div>` : `<div class="pdp-empty">Empty</div>`;
          html += `</div>`;
        });
      } else {
        if(b.drills.length===0){
          html += `<div class="drill-empty">No drills added</div>`;
        } else {
          b.drills.forEach(d => {
            html += `<div class="drill"><div class="drill-title">${d.title}</div>`;
            if (d.drillNotes) html += `<div class="drill-notes">${d.drillNotes}</div>`;
            html += `</div>`;
          });
        }
      }
      html += `</div>`;
      if(dur>0) cumMins += dur;
    });
    html += `<div class="page-footer">BAM Coaches Platform · Page 1</div>`;
    html += `</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const activeBlock = blocks.find(b => b.id === activeBlockId);
  const showDropZone = (idx) => {
    if (dragIdx !== null && dropIdx === idx && dragIdx !== idx) return true;
    if (paletteDrag && canvasDropIdx === idx) return true;
    return false;
  };

  // PDP slot labels
  const PDP_SLOT_META = {
    game1: { label:"Game 1", color:"#9E6B7A", filterLabel:"Game 1 - Competitive" },
    drill: { label:"Drill", color:"#6B9E7A", filterLabel:"Drill - Skill Work" },
    game2: { label:"Game 2", color:"#9E6B7A", filterLabel:"Game 2 - Competitive" },
  };

  return (
    <div style={{ display:"flex", flex:1, overflow:"hidden", height:"100%" }}>
      {/* Left sidebar — Block Palette */}
      <div style={{ width:210, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
        <div style={{ padding:"18px 14px 10px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:GOLD, letterSpacing:1.5, marginBottom:2 }}>PRACTICE BUILDER</div>
          <div style={{ fontSize:10, color:C.textDim }}>Drag blocks onto your plan</div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"10px 10px 6px" }}>
          {BLOCK_CATEGORIES.map(cat => {
            const hasSubs = cat.subs.length > 0;
            const isExpanded = expandedCat === cat.id;
            return (
              <div key={cat.id} style={{ marginBottom:4 }}>
                <div
                  draggable={!hasSubs && !cat.isCustom}
                  onDragStart={e => !hasSubs && !cat.isCustom && onPaletteDragStart(e, cat.id)}
                  onDragEnd={onPaletteDragEnd}
                  className="pp-block"
                  onClick={() => {
                    if (hasSubs) setExpandedCat(isExpanded ? null : cat.id);
                    else if (cat.isCustom) { /* handled below */ }
                    else addBlock(cat.id);
                  }}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:8,
                    background:C.bgHover, border:`1px solid ${C.border}`,
                    cursor: hasSubs ? "pointer" : (cat.isCustom ? "pointer" : "grab") }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:cat.color+"25",
                    border:`1px solid ${cat.color}50`, display:"flex", alignItems:"center",
                    justifyContent:"center", flexShrink:0 }}>
                    {(BLOCK_ICON_MAP[cat.icon] || BLOCK_ICON_MAP.custom)(cat.color, 13)}
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:C.text, flex:1, lineHeight:1.2 }}>{cat.label}</span>
                  {hasSubs && (isExpanded ? <ChevronDown size={12} color={C.textDim}/> : <ChevronRight size={12} color={C.textDim}/>)}
                </div>
                {/* Sub-types */}
                {isExpanded && hasSubs && (
                  <div style={{ marginLeft:12, marginTop:3 }}>
                    {cat.subs.map(s => (
                      <div key={s.id}
                        draggable
                        onDragStart={e => onPaletteDragStart(e, s.id)}
                        onDragEnd={onPaletteDragEnd}
                        className="pp-block"
                        onClick={() => addBlock(s.id)}
                        style={{ fontSize:11, fontWeight:600, color:C.textMid, padding:"6px 10px",
                          borderRadius:6, marginBottom:3, cursor:"grab",
                          borderLeft:`3px solid ${cat.color}40`, background:C.bgHover }}>
                        {s.label}
                      </div>
                    ))}
                  </div>
                )}
                {/* Custom block input */}
                {cat.isCustom && (
                  <div style={{ marginTop:3, display:"flex", gap:4 }}>
                    <input value={customBlockName} onChange={e => setCustomBlockName(e.target.value)}
                      onKeyDown={e => { if (e.key==="Enter" && customBlockName.trim()) { addBlock("custom", customBlockName.trim()); setCustomBlockName(""); } }}
                      placeholder="Custom name..."
                      style={{ flex:1, fontSize:10, padding:"5px 8px", borderRadius:5,
                        background:C.bgHover, border:`1px solid ${C.border}`, outline:"none",
                        color:C.text, fontFamily:"'DM Sans',sans-serif" }}/>
                    <div className="btn" onClick={() => { if (customBlockName.trim()) { addBlock("custom", customBlockName.trim()); setCustomBlockName(""); } }}
                      style={{ fontSize:10, fontWeight:700, padding:"5px 8px", borderRadius:5,
                        background:GOLD, color:"#111" }}>+</div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Templates */}
          <div style={{ borderTop:`1px solid ${C.border}`, marginTop:10, paddingTop:10 }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.textDim, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Templates</div>
            {[["60min","60-Min Session"],["90min","90-Min Team"]].map(([k,l]) => (
              <div key={k} className="btn" onClick={() => loadTemplate(k)}
                style={{ fontSize:11, fontWeight:600, color:C.textMid, padding:"7px 10px",
                  borderRadius:7, border:`1px solid ${C.border}`, marginBottom:4,
                  background:C.bgHover }}>
                {l}
              </div>
            ))}
          </div>

          {/* Saved plans toggle */}
          <div style={{ borderTop:`1px solid ${C.border}`, marginTop:10, paddingTop:10 }}>
            <div className="btn" onClick={() => setShowSavedPlans(!showSavedPlans)}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontSize:10, fontWeight:800, color:C.textDim, letterSpacing:1, textTransform:"uppercase" }}>
                Saved Plans ({savedPlans.length})
              </div>
              {showSavedPlans ? <ChevronUp size={11} color={C.textDim}/> : <ChevronDown size={11} color={C.textDim}/>}
            </div>
            {showSavedPlans && savedPlans.map(p => {
              const truncName = p.name.length > 30 ? p.name.slice(0,30)+"…" : p.name;
              return (
              <div key={p.id} style={{ padding:"7px 10px", borderRadius:7, border:`1px solid ${C.border}`,
                marginBottom:4, background:C.bgHover, cursor:"pointer", position:"relative" }}>
                <div className="btn" onClick={() => loadSavedPlan(p)}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.text, marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", paddingRight:16 }} title={p.name}>{truncName}</div>
                  <div style={{ fontSize:9, color:C.textDim }}>{p.totalMins} min · {p.blocks.length} blocks</div>
                </div>
                <div className="btn" onClick={e => { e.stopPropagation(); setDeleteConfirm(p.id); }}
                  style={{ position:"absolute", top:7, right:8 }}>
                  <Trash2 size={9} color={C.textDim}/>
                </div>
              </div>
            );})}
          </div>
        </div>
      </div>

      {/* Center — Plan Canvas */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* Top bar */}
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:12, flexShrink:0, flexWrap:"wrap" }}>
          <FileText size={18} color={GOLD} strokeWidth={2}/>
          {editingName ? (
            <div style={{position:"relative"}}>
              <input ref={planNameRef} value={planName} onChange={e=>{setPlanName(e.target.value);if(e.target.value.trim())setNamePromptVisible(false);}}
                onBlur={() => setEditingName(false)} onKeyDown={e => e.key==="Enter"&&setEditingName(false)}
                autoFocus placeholder="Plan name..."
                style={{ fontSize:16, fontWeight:800, color:C.text, background:"transparent",
                  border:`1px solid ${namePromptVisible?"#E06060":GOLD}`, borderRadius:6, padding:"4px 10px",
                  outline:"none", fontFamily:"'DM Sans',sans-serif", minWidth:160 }}/>
              {namePromptVisible&&<div style={{position:"absolute",top:"100%",left:0,fontSize:11,color:"#E06060",fontWeight:600,marginTop:2,whiteSpace:"nowrap"}}>Please name your plan before saving</div>}
            </div>
          ) : (
            <div className="btn" onClick={() => setEditingName(true)}
              style={{ fontSize:16, fontWeight:800, color:C.text }}>
              {planName || "Untitled Plan"}
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:C.textDim, marginLeft:4 }}>
            <Clock size={12} color={C.textDim}/>{totalMins} min
          </div>
          <div style={{ fontSize:12, color:C.textDim }}>{blocks.length} blocks</div>
          <div style={{ flex:1 }}/>
          {/* Prompt 6: Export PDF only for saved plans with drills */}
          {blocks.length>0&&blocks.some(b=>b.drills?.length>0||(b.pdpSlots&&Object.values(b.pdpSlots).some(s=>s)))&&saved&&(
            <div className="btn" onClick={exportPDF}
              style={{ fontSize:12, fontWeight:700, color:C.textMid, padding:"7px 14px", borderRadius:7,
                border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:6 }}>
              <Download size={12} color={C.textDim}/> Export PDF
            </div>
          )}
          {/* Prompt 6: Save button with tooltip */}
          <div style={{position:"relative"}}>
            <div className="btn" onClick={savePlan}
              style={{ fontSize:13, fontWeight:800, color:blocks.length===0?"#666":"#111", background:blocks.length===0?(dark?"#333":"#ddd"):GOLD,
                padding:"8px 18px", borderRadius:8, boxShadow:blocks.length===0?"none":`0 4px 14px ${GOLD}44`,
                display:"flex", alignItems:"center", gap:6,
                cursor:blocks.length===0?"not-allowed":"pointer",
                pointerEvents:blocks.length===0?"none":"auto" }}>
              <Save size={14} color={blocks.length===0?"#666":"#111"}/>
              {saved ? "Saved" : "Save Plan"}
            </div>
            {blocks.length===0&&(
              <div style={{position:"absolute",top:"100%",right:0,fontSize:10,color:C.textDim,marginTop:4,whiteSpace:"nowrap",fontStyle:"italic"}}>Add at least one block to save</div>
            )}
          </div>
        </div>

        {/* Canvas scroll area */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 40px" }}
          onDragOver={e => { e.preventDefault(); if (paletteDrag && blocks.length === 0) setCanvasDropIdx(0); }}
          onDrop={e => { if (paletteDrag && blocks.length === 0) { e.preventDefault(); insertBlockAt(paletteDrag, 0); setPaletteDrag(null); setCanvasDropIdx(null); } }}>
          {/* Progress bar */}
          {blocks.length > 0 && (
            <div style={{ display:"flex", gap:3, marginBottom:18, height:6, borderRadius:6, overflow:"hidden" }}>
              {blocks.map(b => {
                const { category } = findBlockMeta(b.type);
                const pct = totalMins > 0 ? (b.duration/totalMins)*100 : 0;
                return <div key={b.id} title={`${category.label} - ${b.duration}min`}
                  style={{ flex:`0 0 ${pct}%`, background:category.color, borderRadius:2, transition:"flex .3s" }}/>;
              })}
            </div>
          )}

          {/* Empty state */}
          {blocks.length === 0 && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", height:"60%", gap:14, color:C.textDim,
              border: paletteDrag ? `2px dashed ${GOLD}60` : "none", borderRadius:16,
              background: paletteDrag ? (dark?"rgba(226,221,159,0.03)":"rgba(226,221,159,0.06)") : "transparent",
              transition:"all .2s" }}>
              <FileText size={40} color={C.textDim} strokeWidth={1.2} style={{ opacity:.4 }}/>
              <div style={{ fontSize:16, fontWeight:700 }}>
                {paletteDrag ? "Drop here to add" : "Your plan is empty"}
              </div>
              <div style={{ fontSize:13 }}>
                {paletteDrag ? "Release to add this block" : "Drag blocks from the palette, or load a template"}
              </div>
            </div>
          )}

          {/* Blocks */}
          {blocks.map((b, idx) => {
            const { category, sub } = findBlockMeta(b.type);
            const color = category.color;
            const blockLabel = b.customName || (sub ? sub.label : category.label);
            const isDragging = dragIdx === idx;
            const isActive = activeBlockId === b.id;
            const isPDP = !!b.pdpSlots;
            let cumMins = 0;
            for (let i = 0; i < idx; i++) cumMins += blocks[i].duration;

            return (
              <div key={b.id}>
                {/* Drop zone indicator */}
                <div className="pp-drop-zone"
                  onDragOver={e => onCanvasDragOver(e, idx)}
                  onDrop={e => onCanvasDrop(e, idx)}
                  style={{ height: showDropZone(idx) ? 40 : 6, opacity: showDropZone(idx) ? 1 : 0,
                    display:"flex", alignItems:"center", justifyContent:"center", transition:"height .2s ease, opacity .2s ease" }}>
                  {showDropZone(idx) && <div style={{ width:"90%", height:3, borderRadius:2, background:GOLD }}/>}
                </div>

                <div className={`pp-block${isDragging?" dragging":""}`} draggable
                  onDragStart={e => onBlockDragStart(e, idx)}
                  onDragEnd={onBlockDragEnd}
                  style={{ marginBottom:4, borderRadius:11, background:C.bgCard,
                    border:`1px solid ${isActive ? GOLD+"70" : C.border}`,
                    borderLeft:`4px solid ${color}`,
                    boxShadow: isActive ? `0 2px 12px ${GOLD}15` : "none" }}>

                  {/* Block header row */}
                  <div style={{ display:"flex", gap:10, alignItems:"center", padding:"12px 14px 8px" }}>
                    <div style={{ cursor:"grab", color:C.textDim, display:"flex", alignItems:"center" }}>
                      <GripVertical size={16} color={C.textDim}/>
                    </div>
                    <div style={{ width:30, height:30, borderRadius:7, background:color+"25",
                      border:`1px solid ${color}50`, display:"flex", alignItems:"center",
                      justifyContent:"center", flexShrink:0 }}>
                      {(BLOCK_ICON_MAP[category.icon] || BLOCK_ICON_MAP.custom)(color, 14)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {category.isCustom ? (
                          <input value={b.customName} onChange={e => updateBlock(b.id,"customName",e.target.value)}
                            placeholder="Block name..."
                            style={{ fontSize:13, fontWeight:800, color:C.text, background:"transparent",
                              border:"none", outline:"none", fontFamily:"'DM Sans',sans-serif", flex:1, minWidth:0 }}/>
                        ) : (
                          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{blockLabel}</div>
                        )}
                        {sub && <div style={{ fontSize:10, color:color, fontWeight:600, background:color+"18", padding:"2px 8px", borderRadius:8 }}>{category.label}</div>}
                      </div>
                      <div style={{ fontSize:10, color:C.textDim, marginTop:2 }}>
                        {b.duration ? `${cumMins}-${cumMins+b.duration} min` : "N/A"}
                      </div>
                    </div>
                    {/* Duration selector */}
                    <div style={{ display:"flex", alignItems:"center", gap:3, flexShrink:0 }}>
                      {DURATION_PRESETS.map(d => (
                        <div key={d} className="btn" onClick={() => updateBlock(b.id,"duration",d)}
                          style={{ width:26, height:22, borderRadius:4, fontSize:10, fontWeight:700,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            background: b.duration===d ? GOLD : C.bgHover,
                            color: b.duration===d ? "#111" : C.textDim,
                            border:`1px solid ${b.duration===d ? GOLD : C.border}` }}>
                          {d}
                        </div>
                      ))}
                      <input type="number" min={1} max={120} value={b.duration}
                        onChange={e => updateBlock(b.id,"duration",Math.max(1,parseInt(e.target.value)||1))}
                        style={{ width:34, background:C.bgHover, border:`1px solid ${C.border}`, borderRadius:4,
                          outline:"none", fontSize:10, fontWeight:700, color:C.text,
                          fontFamily:"'DM Sans',sans-serif", textAlign:"center", padding:"2px 1px" }}/>
                      <span style={{ fontSize:10, color:C.textDim }}>min</span>
                    </div>
                    <div className="btn" onClick={() => removeBlock(b.id)}
                      style={{ flexShrink:0, marginLeft:2 }}>
                      <Trash2 size={13} color={C.textDim}/>
                    </div>
                  </div>

                  {/* Block notes */}
                  <div style={{ padding:"0 14px 4px 58px" }}>
                    <input value={b.notes} onChange={e => updateBlock(b.id,"notes",e.target.value)}
                      placeholder="Block notes..."
                      style={{ width:"100%", background:"transparent", border:"none", outline:"none",
                        fontSize:12, color:C.textDim, fontFamily:"'DM Sans',sans-serif",
                        fontStyle:"italic", caretColor:GOLD }}/>
                  </div>

                  {/* PDP structure — 3 distinct droppable slots */}
                  {isPDP && (
                    <div style={{ padding:"6px 14px 10px 58px", display:"flex", gap:8 }}>
                      {["game1","drill","game2"].map(slot => {
                        const meta = PDP_SLOT_META[slot];
                        const slotDrill = b.pdpSlots[slot];
                        const isSlotActive = isActive && activePdpSlot === slot;
                        const thumbColor = slotDrill ? (SECTION_COLORS[slotDrill.section]||SECTION_COLORS.pd)[(slotDrill.id||0)%8] : null;
                        return (
                          <div key={slot} style={{ flex:1, borderRadius:8,
                            background: isSlotActive ? (dark?"rgba(226,221,159,0.08)":"rgba(226,221,159,0.12)") : (dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"),
                            border:`1px solid ${isSlotActive ? GOLD+"60" : (slot==="drill" ? "#6B9E7A30" : "#9E6B7A30")}`,
                            padding:"8px 10px", transition:"all .15s" }}>
                            <div style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:.8,
                              color: meta.color, marginBottom:6 }}>
                              {meta.label}
                            </div>
                            {slotDrill ? (
                              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                                <div style={{ width:28, height:28, borderRadius:5, background:thumbColor, flexShrink:0,
                                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  <Play size={8} color="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.8)"/>
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:11, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{slotDrill.title}</div>
                                </div>
                                <div className="btn" onClick={() => clearPdpSlot(b.id, slot)} style={{ flexShrink:0 }}>
                                  <X size={10} color={C.textDim}/>
                                </div>
                              </div>
                            ) : (
                              <div className="btn" onClick={() => { setActiveBlockId(b.id); setActivePdpSlot(slot); }}
                                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                                  padding:"6px 0", borderRadius:5, border:`1px dashed ${meta.color}40`,
                                  fontSize:10, fontWeight:600, color:C.textDim }}>
                                <Plus size={10} color={C.textDim}/> Add
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Regular drills list (non-PDP blocks) */}
                  {!isPDP && b.drills.length > 0 && (
                    <div style={{ padding:"4px 14px 6px 50px" }}>
                      {b.drills.map((d, di) => {
                        const thumbColor = (SECTION_COLORS[d.section]||SECTION_COLORS.pd)[(d.id||0)%8];
                        const isDrillDragging = drillDrag?.blockId===b.id && drillDrag?.drillIdx===di;
                        const isDrillDropBefore = drillDropTarget?.blockId===b.id && drillDropTarget?.drillIdx===di && drillDrag && !(drillDrag.blockId===b.id && drillDrag.drillIdx===di);
                        return (
                          <div key={`${d.section}-${d.id}-${di}`}>
                            {isDrillDropBefore && <div style={{ height:3, background:GOLD, borderRadius:2, margin:"3px 0" }}/>}
                            <div className={`pp-drill-item${isDrillDragging?" dragging":""}`}
                              draggable
                              onDragStart={e => onDrillDragStart(e, b.id, di)}
                              onDragOver={e => onDrillDragOver(e, b.id, di)}
                              onDrop={e => onDrillDrop(e, b.id, di)}
                              onDragEnd={onDrillDragEnd}
                              style={{ display:"flex", gap:8, alignItems:"center", padding:"6px 8px",
                                borderRadius:7, background:C.bgHover, border:`1px solid ${C.border}`,
                                marginBottom:4 }}>
                              <GripVertical size={12} color={C.textDim} style={{ cursor:"grab", flexShrink:0 }}/>
                              <div style={{ width:28, height:28, borderRadius:5, background:thumbColor, flexShrink:0,
                                display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <Play size={9} color="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.8)"/>
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:12, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.title}</div>
                                <input value={d.drillNotes || ""} onChange={e => updateDrillNotes(b.id, di, e.target.value)}
                                  placeholder="Drill notes..."
                                  style={{ width:"100%", background:"transparent", border:"none", outline:"none",
                                    fontSize:10, color:C.textDim, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic", marginTop:1 }}/>
                              </div>
                              <div className="btn" onClick={() => removeDrillFromBlock(b.id, d)} style={{ flexShrink:0 }}>
                                <X size={11} color={C.textDim}/>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Drop zone at end of drill list */}
                      <div onDragOver={e => onDrillDragOver(e, b.id, b.drills.length)}
                        onDrop={e => onDrillDrop(e, b.id, b.drills.length)}
                        style={{ height:drillDropTarget?.blockId===b.id && drillDropTarget?.drillIdx===b.drills.length ? 16 : 4 }}>
                        {drillDropTarget?.blockId===b.id && drillDropTarget?.drillIdx===b.drills.length && (
                          <div style={{ height:3, background:GOLD, borderRadius:2, margin:"3px 0" }}/>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prompt 4: empty state for blocks with no drills */}
                  {!isPDP && b.drills.length === 0 && (
                    <div style={{ padding:"8px 14px 8px 58px" }}>
                      <div style={{ border:`1px dashed ${C.border}`, borderRadius:8, padding:"14px 16px",
                        textAlign:"center", color:C.textDim, fontSize:12 }}>
                        No drills added yet
                        <div className="btn" onClick={() => { setActiveBlockId(b.id); setActivePdpSlot(null); }}
                          style={{ display:"inline-flex", alignItems:"center", gap:4, color:GOLD, fontWeight:700,
                            marginTop:8, fontSize:11 }}>
                          <Plus size={11} color={GOLD}/> Add Drill
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Add drills CTA (non-PDP only, when drills exist) */}
                  {!isPDP && b.drills.length > 0 && (
                    <div style={{ padding:"2px 14px 10px 58px" }}>
                      <div className="btn" onClick={() => { setActiveBlockId(b.id); setActivePdpSlot(null); }}
                        style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px",
                          borderRadius:7, border:`1px dashed ${GOLD}50`,
                          fontSize:11, color:GOLD, fontWeight:600 }}>
                        <Plus size={11} color={GOLD}/>
                        {`${b.drills.length} drill${b.drills.length>1?"s":""} - add more`}
                      </div>
                    </div>
                  )}
                  {/* Prompt 2: custom block name validation error */}
                  {customBlockErrors[b.id] && (
                    <div style={{ padding:"2px 14px 8px 58px", fontSize:11, color:"#E06060", fontWeight:600 }}>
                      {customBlockErrors[b.id]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Drop zone at end for dragging to bottom */}
          {(dragIdx !== null || paletteDrag) && blocks.length > 0 && (
            <div className="pp-drop-zone"
              onDragOver={e => onCanvasDragOver(e, blocks.length)}
              onDrop={e => onCanvasDrop(e, blocks.length)}
              style={{ height: showDropZone(blocks.length) ? 40 : 20, opacity: showDropZone(blocks.length) ? 1 : 0.3,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
              {showDropZone(blocks.length) && <div style={{ width:"90%", height:3, borderRadius:2, background:GOLD }}/>}
            </div>
          )}
        </div>
      </div>

      {/* Right column — Drill search panel */}
      {activeBlock && (
        <div style={{ width:300, borderLeft:`1px solid ${C.border}`, overflow:"hidden", flexShrink:0,
          animation:"slideInRight .2s ease both" }}>
          <DrillSearchPanel
            key={`${activeBlockId}-${activePdpSlot || "main"}`}
            block={activeBlock}
            C={C} dark={dark}
            pdpSlot={activePdpSlot}
            pdpSlotLabel={activePdpSlot ? PDP_SLOT_META[activePdpSlot]?.filterLabel : null}
            onAddDrill={drill => {
              if (activePdpSlot && activeBlock.pdpSlots) {
                setPdpSlotDrill(activeBlock.id, activePdpSlot, drill);
              } else {
                addDrillToBlock(activeBlock.id, drill);
              }
            }}
            onRemoveDrill={drill => {
              if (activePdpSlot && activeBlock.pdpSlots) {
                clearPdpSlot(activeBlock.id, activePdpSlot);
              } else {
                removeDrillFromBlock(activeBlock.id, drill);
              }
            }}
          />
        </div>
      )}

      {/* Prompt 1: block limit message */}
      {blockLimitMsg && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#E06060",color:"#fff",
          padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          fontFamily:"'DM Sans',sans-serif"}}>{blockLimitMsg}</div>
      )}

      {/* Prompt 3: duplicate drill toast */}
      {drillToast && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:dark?"#333":"#555",color:"#fff",
          padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          fontFamily:"'DM Sans',sans-serif"}}>{drillToast}</div>
      )}

      {/* Prompt 5: auto-save confirmation */}
      {autoSaveMsg && (
        <div style={{position:"fixed",top:16,right:24,background:dark?"rgba(226,221,159,0.15)":"rgba(226,221,159,0.25)",
          color:GOLD,padding:"8px 18px",borderRadius:8,fontSize:12,fontWeight:700,zIndex:9999,
          border:`1px solid ${GOLD}40`,fontFamily:"'DM Sans',sans-serif"}}>{autoSaveMsg}</div>
      )}

      {/* Prompt 5: draft banner */}
      {draftBanner && blocks.length===0 && (
        <div style={{position:"fixed",top:64,left:"50%",transform:"translateX(-50%)",background:dark?"#1A1A1A":"#fff",
          border:`1px solid ${GOLD}50`,borderRadius:12,padding:"14px 24px",zIndex:9999,
          boxShadow:`0 8px 30px rgba(0,0,0,0.5)`,display:"flex",alignItems:"center",gap:16,
          fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{fontSize:13,color:C.text,fontWeight:500}}>You have an unsaved plan draft — continue editing?</div>
          <div style={{display:"flex",gap:8}}>
            <div className="btn" onClick={resumeDraft}
              style={{padding:"6px 16px",borderRadius:7,fontSize:12,fontWeight:800,background:GOLD,color:"#111"}}>Resume</div>
            <div className="btn" onClick={discardDraft}
              style={{padding:"6px 16px",borderRadius:7,fontSize:12,fontWeight:700,color:C.textDim,border:`1px solid ${C.border}`}}>Discard</div>
          </div>
        </div>
      )}

      {/* Prompt 6: name exists warning */}
      {nameExistsWarn && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#E06060",color:"#fff",
          padding:"10px 24px",borderRadius:10,fontSize:12,fontWeight:600,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          fontFamily:"'DM Sans',sans-serif",maxWidth:420,textAlign:"center"}}>{nameExistsWarn}</div>
      )}

      {/* Prompt 6: plan limit message */}
      {planLimitMsg && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#E06060",color:"#fff",
          padding:"10px 24px",borderRadius:10,fontSize:12,fontWeight:600,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          fontFamily:"'DM Sans',sans-serif",maxWidth:420,textAlign:"center"}}>{planLimitMsg}</div>
      )}

      {/* Prompt 7: delete confirmation modal */}
      {deleteConfirm && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.6)",fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{background:dark?"#1A1A1A":"#fff",border:`1px solid ${C.border}`,borderRadius:14,
            padding:"28px 32px",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.text,letterSpacing:1,marginBottom:10}}>DELETE PLAN</div>
            <div style={{fontSize:14,color:C.textMid,lineHeight:1.6,marginBottom:24}}>Delete this plan? This cannot be undone.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <div className="btn" onClick={()=>setDeleteConfirm(null)}
                style={{padding:"8px 24px",borderRadius:8,fontSize:13,fontWeight:700,color:C.textMid,border:`1px solid ${C.border}`}}>Cancel</div>
              <div className="btn" onClick={()=>doDeleteSavedPlan(deleteConfirm)}
                style={{padding:"8px 24px",borderRadius:8,fontSize:13,fontWeight:800,background:"#E06060",color:"#fff",border:"none"}}>Delete</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CONTENT PAGE ────────────────────────────────────────────────────────────
function ContentPage({sectionId, C, dark, favDrills=[], toggleFav}){
  const [activeFilters, setActiveFilters] = useState(["All"]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(()=>{try{return JSON.parse(localStorage.getItem("bam_recent_searches")||"[]");}catch{return[];}});
  const scrollContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  // Prompt 8: masterclass progress
  const [masterProgress, setMasterProgress] = useState(()=>{try{return JSON.parse(localStorage.getItem("bam_master_progress")||"{}");}catch{return{};}});

  if (sectionId === "plans") return <PracticePlansPage C={C} dark={dark}/>;
  const section = CONTENT[sectionId];
  const navItem = NAV.find(n=>n.id===sectionId);

  // Prompt 1: save search to recents
  const commitSearch=(term)=>{
    const t=term.trim();
    if(!t) return;
    const updated=[t,...recentSearches.filter(s=>s!==t)].slice(0,5);
    setRecentSearches(updated);
    try{localStorage.setItem("bam_recent_searches",JSON.stringify(updated));}catch{}
    setSearchFocused(false);
  };

  // Prompt 2: filter stacking — group filters by classification
  const filterGroups = {};
  section.filters.filter(f=>f!=="All").forEach(f=>{
    // Classify by matching item properties
    const matchesLevel = section.items.some(i=>i.level===f);
    const group = matchesLevel ? "level" : "tag";
    if(!filterGroups[group]) filterGroups[group]={label:group==="level"?"Level":"Category",filters:[]};
    filterGroups[group].filters.push(f);
  });

  const toggleFilter=(f)=>{
    if(f==="All"){setActiveFilters(["All"]);return;}
    setActiveFilters(prev=>{
      const without=prev.filter(x=>x!=="All"&&x!==f);
      const has=prev.includes(f);
      if(has){return without.length===0?["All"]:without;}
      return [...without,f];
    });
  };

  // Prompt 2: AND between groups, OR within groups
  const activeNonAll = activeFilters.filter(f=>f!=="All");
  const activeLevelFilters = activeNonAll.filter(f=>section.items.some(i=>i.level===f));
  const activeTagFilters = activeNonAll.filter(f=>section.items.some(i=>i.tag===f)&&!section.items.some(i=>i.level===f));

  let filtered = section.items;
  if(activeNonAll.length>0){
    filtered = filtered.filter(item=>{
      const passLevel = activeLevelFilters.length===0 || activeLevelFilters.includes(item.level);
      const passTag = activeTagFilters.length===0 || activeTagFilters.includes(item.tag);
      return passLevel && passTag;
    });
  }

  // Prompt 1: search filtering
  const trimQ = searchQ.trim().toLowerCase();
  const isSearching = trimQ.length > 0;
  if(isSearching){
    filtered = filtered.filter(item=>
      item.title.toLowerCase().includes(trimQ)||
      item.sub.toLowerCase().includes(trimQ)||
      item.tag.toLowerCase().includes(trimQ)||
      item.desc.toLowerCase().includes(trimQ)
    );
  }

  // Prompt 5: scroll position memory
  const scrollKey = `bam_scroll_${sectionId}`;
  const openDetail=(item)=>{
    if(scrollContainerRef.current){
      try{sessionStorage.setItem(scrollKey,""+scrollContainerRef.current.scrollTop);}catch{}
    }
    setSelectedItem(item);
  };
  const closeDetail=()=>{
    setSelectedItem(null);
    setTimeout(()=>{
      if(scrollContainerRef.current){
        try{const pos=parseInt(sessionStorage.getItem(scrollKey)||"0",10);scrollContainerRef.current.scrollTop=pos;}catch{}
      }
    },0);
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden",height:"100%"}}>
      <div ref={scrollContainerRef} style={{flex:1,overflow:"auto",padding:28}}>
        {/* Header */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            {navItem&&<navItem.Icon size={20} color={GOLD} strokeWidth={2}/>}
            <div style={{fontSize:22,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:.5}}>{section.title}</div>
          </div>
          <div style={{fontSize:14,color:C.textDim}}>{section.desc}</div>
        </div>

        {/* Prompt 1: Search bar */}
        <div style={{position:"relative",marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:9,background:C.bgHover,border:`1px solid ${searchFocused?GOLD+"60":C.border}`,borderRadius:10,padding:"8px 14px",transition:"border-color .2s"}}>
            <Ic.Search c={GOLD} s={14}/>
            <input ref={searchInputRef} value={searchQ}
              onChange={e=>setSearchQ(e.target.value)}
              onFocus={()=>setSearchFocused(true)}
              onBlur={()=>setTimeout(()=>setSearchFocused(false),200)}
              onKeyDown={e=>{if(e.key==="Enter"&&searchQ.trim())commitSearch(searchQ);}}
              placeholder="Search content..."
              style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:C.text,fontFamily:"'DM Sans',sans-serif"}}/>
            {searchQ&&<span className="btn" onClick={()=>{setSearchQ("");setSearchFocused(false);}} style={{color:C.textDim,fontSize:14,lineHeight:1}}>×</span>}
          </div>
          {/* Prompt 1: Recent searches dropdown */}
          {searchFocused&&!searchQ&&recentSearches.length>0&&(
            <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:20,marginTop:4,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 0",boxShadow:dark?"0 8px 24px rgba(0,0,0,0.5)":`0 8px 24px ${C.shadow}`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.textDim,padding:"4px 14px",letterSpacing:.8,textTransform:"uppercase"}}>Recent Searches</div>
              {recentSearches.map((s,i)=>(
                <div key={i} className="btn" onMouseDown={e=>{e.preventDefault();setSearchQ(s);commitSearch(s);}}
                  style={{padding:"7px 14px",fontSize:13,color:C.textMid,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                  <Clock size={11} color={C.textDim}/>{s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters — Prompt 2: grouped */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
            <div className="tag-pill" onClick={()=>toggleFilter("All")}
              style={{fontSize:12,fontWeight:700,padding:"6px 16px",borderRadius:20,border:`1px solid ${activeFilters.includes("All")?GOLD:C.border}`,background:activeFilters.includes("All")?GOLD:"transparent",color:activeFilters.includes("All")?"#111":C.textMid,transition:"all .15s"}}>
              All
            </div>
            {Object.entries(filterGroups).map(([gKey,g])=>(
              <div key={gKey} style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:9,fontWeight:700,color:C.textDim,textTransform:"uppercase",letterSpacing:.8,marginRight:2}}>{g.label}:</span>
                {g.filters.map(f=>(
                  <div key={f} className="tag-pill" onClick={()=>toggleFilter(f)}
                    style={{fontSize:12,fontWeight:700,padding:"6px 16px",borderRadius:20,border:`1px solid ${activeFilters.includes(f)?GOLD:C.border}`,background:activeFilters.includes(f)?GOLD:"transparent",color:activeFilters.includes(f)?"#111":C.textMid,transition:"all .15s"}}>
                    {f}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Active filter summary */}
          {activeNonAll.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.textMid,marginBottom:4}}>
              <span style={{fontWeight:700}}>Showing:</span>
              {activeLevelFilters.length>0&&<span>{activeLevelFilters.join(" or ")}</span>}
              {activeLevelFilters.length>0&&activeTagFilters.length>0&&<span>·</span>}
              {activeTagFilters.length>0&&<span>{activeTagFilters.join(" or ")}</span>}
              <span className="btn" onClick={()=>setActiveFilters(["All"])} style={{color:C.textDim,fontSize:13,marginLeft:4,cursor:"pointer"}}>×</span>
            </div>
          )}
        </div>

        {/* New badge row */}
        {!isSearching&&filtered.some(i=>i.isNew)&&(
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}>
            <span style={{fontSize:16}}>⚡</span>
            <span style={{fontSize:15,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:.5}}>New This Week</span>
            <div style={{flex:1,height:1,background:C.border}}/>
          </div>
        )}

        {/* Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16}}>
          {filtered.map(item=>(
            <ContentCard key={item.id} item={item} sectionId={sectionId} C={C} dark={dark} onClick={openDetail} favDrills={favDrills} toggleFav={toggleFav} masterProgress={masterProgress}/>
          ))}
        </div>

        {/* Prompt 1: empty states */}
        {filtered.length===0&&isSearching&&(
          <div style={{textAlign:"center",padding:"60px 0",color:C.textDim}}>
            <img src={LOGO} alt="BAM" className="micro-pulse" style={{width:48,height:56,objectFit:"contain",margin:"0 auto 16px",display:"block",opacity:.45,filter:`drop-shadow(0 0 12px ${GOLD}33)`}}/>
            <div style={{fontSize:15,fontWeight:600,marginBottom:20}}>Nothing found — search again with a different idea!</div>
            <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",maxWidth:420,margin:"0 auto",textAlign:"left"}}>
              <div style={{fontSize:11,fontWeight:800,color:GOLD,letterSpacing:.8,textTransform:"uppercase",marginBottom:10}}>AI Suggestions</div>
              <div style={{fontSize:13,color:C.textMid,lineHeight:1.7}}>
                {trimQ.includes("finish")&&<div style={{marginBottom:6}}>Try: "1v1 Live Finishing" — a constraint drill for creative finishing</div>}
                {trimQ.includes("shoot")&&<div style={{marginBottom:6}}>Try: "Catch & Shoot Progression" — systematic shooting series</div>}
                {!trimQ.includes("finish")&&!trimQ.includes("shoot")&&(
                  <>
                    <div style={{marginBottom:6}}>Try searching for a specific skill like "finishing" or "handles"</div>
                    <div style={{marginBottom:6}}>Or browse by filter tags above</div>
                    <div>Try broader terms like "drill", "game", or "decision"</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {filtered.length===0&&!isSearching&&(
          <div style={{textAlign:"center",padding:"60px 0",color:C.textDim}}>
            <Filter size={32} color={C.textDim} style={{marginBottom:12,opacity:.4}}/>
            <div style={{fontSize:15,fontWeight:600}}>No content with this filter yet.</div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedItem&&(
        <ContentDetail item={selectedItem} sectionId={sectionId} C={C} dark={dark} onClose={closeDetail} masterProgress={masterProgress} setMasterProgress={setMasterProgress}/>
      )}
    </div>
  );
}

// ── MEMBER CARD ────────────────────────────────────────────────────────────
function MemberCard({name,anchorRef,C,dark,onClose}){
  const m=MEMBERS[name]; if(!m) return null;
  const ac=getAC(name);
  const rect=anchorRef.current?.getBoundingClientRect();
  const top=rect?Math.min(rect.bottom+8,window.innerHeight-230):100;
  const left=rect?Math.min(rect.left,window.innerWidth-280):100;
  return (
    <div className="member-card" onClick={e=>e.stopPropagation()} style={{position:"fixed",zIndex:1000,background:dark?"#2A2A2A":"#fff",border:`1px solid ${dark?"#444":C.border}`,borderRadius:14,padding:18,width:262,boxShadow:dark?"0 16px 48px rgba(0,0,0,0.6)":"0 12px 40px rgba(0,0,0,0.14)",top,left}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{width:46,height:46,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",boxShadow:`0 3px 12px ${ac}66`}}>{m.initials}</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:dark?"#F2F2F2":C.text}}>{name}</div>
            <div style={{fontSize:12,color:dark?"#888":C.textDim,marginTop:2,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:13}}>{m.flag}</span>{m.loc}</div>
          </div>
        </div>
        <span className="btn" onClick={onClose}><Ic.Close c={dark?"#666":C.textDim} s={11}/></span>
      </div>
      <div style={{fontSize:13,color:dark?"#AAA":C.textMid,lineHeight:1.6,marginBottom:14}}>{m.bio}</div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {m.ig&&<div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:dark?"#888":C.textDim,background:dark?"#333":C.bgHover,padding:"5px 10px",borderRadius:7,fontWeight:600}}><Ic.IG c={dark?"#888":C.textDim} s={12}/>@{m.ig}</div>}
        {m.tw&&<div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:dark?"#888":C.textDim,background:dark?"#333":C.bgHover,padding:"5px 10px",borderRadius:7,fontWeight:600}}><Ic.TW c={dark?"#888":C.textDim} s={11}/>@{m.tw}</div>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,borderTop:`1px solid ${dark?"#333":C.border}`}}>
        {[["Posts",m.posts],["Points",LEADERBOARD.find(l=>l.n===name)?.pts??"—"],["Rank","#"+(LEADERBOARD.findIndex(l=>l.n===name)+1)||"—"]].map(([l,v])=>(
          <div key={l} style={{textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:dark?GOLD:"#111"}}>{v}</div>
            <div style={{fontSize:11,color:dark?"#666":C.textDim}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SEARCH BAR ─────────────────────────────────────────────────────────────
function SearchBar({C}){
  const [hIdx,setHIdx]=useState(0);
  const [typed,setTyped]=useState("");
  useEffect(()=>{
    const hint=HINTS[hIdx]; let i=0; setTyped("");
    const iv=setInterval(()=>{ i++; setTyped(hint.slice(0,i)); if(i>=hint.length){ clearInterval(iv); setTimeout(()=>setHIdx(x=>(x+1)%HINTS.length),2000); } },48);
    return ()=>clearInterval(iv);
  },[hIdx]);
  return (
    <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:22,padding:"8px 18px",display:"flex",alignItems:"center",gap:9,width:256,cursor:"text"}}>
      <Ic.Search c={GOLD} s={13}/>
      <span style={{fontSize:13,color:C.textDim,flex:1,overflow:"hidden",whiteSpace:"nowrap"}}>
        {typed}<span style={{borderRight:`2px solid ${GOLD}`,marginLeft:1,display:"inline-block",height:"0.85em",verticalAlign:"text-bottom",animation:"blink 1s infinite"}}/>
      </span>
    </div>
  );
}

// ── POST CARD ──────────────────────────────────────────────────────────────
function PostCard({p,C,dark,compact,onTagClick,activeTag,onProfileClick,showLikeHint,onDelete}){
  const [lk,setLk]=useState(false);
  const [la,setLa]=useState(false);
  const [open,setOpen]=useState(false);
  const [bk,setBk]=useState(false);
  const [replyText,setReply]=useState("");
  const [replies,setReplies]=useState(p.replies);
  const [memberOpen,setMemberOpen]=useState(false);
  const [lastTap,setLastTap]=useState(0);
  const [hintVis,setHintVis]=useState(!!showLikeHint);
  const [showDeleteModal,setShowDeleteModal]=useState(false);
  const [deleted,setDeleted]=useState(false);
  useEffect(()=>{if(showLikeHint){const t=setTimeout(()=>setHintVis(false),3000);return()=>clearTimeout(t);}},[showLikeHint]);
  const nameRef=useRef(null);
  const ac=getAC(p.author);
  const border=getCardBorder(p.id);
  const memberAv=MEMBERS[p.author];

  const like=()=>{ setLk(v=>!v); setLa(true); setTimeout(()=>setLa(false),420); };
  const submitReply=()=>{ if(!replyText.trim()) return; setReplies(r=>[...r,replyText.trim()]); setReply(""); };
  const tapCount=useRef(0);
  const tapTimer=useRef(null);

  const handleDoubleTap=()=>{
    tapCount.current++;
    if(tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current=setTimeout(()=>{tapCount.current=0;},400);
    if(tapCount.current===2){ if(!lk){like();} tapCount.current=0; }
    else if(tapCount.current>=3){ tapCount.current=0; }
  };

  const fmtLikes=(n)=>{if(n>=10000) return Math.floor(n/1000)+"k"; if(n>=1000){const k=n/1000;return k%1===0?k+"k":k.toFixed(1)+"k";} return n;};

  if(deleted) return null;

  const avatar = (
    <div className="btn" onClick={e=>{e.stopPropagation();onProfileClick&&onProfileClick(p.author);}}
      style={{width:40,height:40,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",
        justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0,
        boxShadow:`0 2px 8px ${ac}55`,overflow:"hidden"}}>
      {memberAv?.photo
        ?<img src={memberAv.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
        :<span>{memberAv?.initials}</span>}
    </div>
  );

  return (
    <div className="pc" onClick={()=>{ if(memberOpen) setMemberOpen(false); handleDoubleTap(); }}
      style={{background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`3px solid ${border}`,
        borderRadius:11,padding:compact?"14px 16px":"20px 22px",marginBottom:12,
        boxShadow:dark?"none":`0 2px 8px ${C.shadow}`,"--hs":`0 6px 22px ${C.shadow}`,
        userSelect:"none",cursor:"default",position:"relative"}}>
      {memberOpen&&<MemberCard name={p.author} anchorRef={nameRef} C={C} dark={dark} onClose={()=>setMemberOpen(false)}/>}
      {/* Delete confirmation modal */}
      {showDeleteModal&&(
        <div onClick={e=>e.stopPropagation()} style={{position:"fixed",inset:0,zIndex:5000,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:dark?"#1A1A1A":"#fff",borderRadius:14,padding:"28px 32px",maxWidth:360,textAlign:"center",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:8}}>Delete this post?</div>
            <div style={{fontSize:13,color:C.textDim,marginBottom:22,lineHeight:1.6}}>All comments will also be removed.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setShowDeleteModal(false)} style={{padding:"8px 24px",borderRadius:8,fontSize:13,fontWeight:700,background:"transparent",color:C.textMid,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{setShowDeleteModal(false);setDeleted(true);onDelete&&onDelete(p.id);}} style={{padding:"8px 24px",borderRadius:8,fontSize:13,fontWeight:700,background:"#E06060",color:"#fff",border:"none",cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Author row */}
      <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
        {avatar}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <span ref={nameRef} className="btn" onClick={e=>{e.stopPropagation();onProfileClick?onProfileClick(p.author):setMemberOpen(v=>!v);}} style={{fontSize:15,fontWeight:700,color:C.text}}>{p.author}</span>
            {memberAv?.ig&&<span className="btn" style={{display:"flex"}}><Ic.IG c={C.textDim}/></span>}
            {memberAv?.tw&&<span className="btn" style={{display:"flex"}}><Ic.TW c={C.textDim}/></span>}
          </div>
          <div style={{fontSize:12,color:C.textDim,display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:13}}>{memberAv?.flag}</span>
            {memberAv?.loc} · {p.time}
          </div>
        </div>
        <div className="tag-pill" onClick={e=>{e.stopPropagation();onTagClick&&onTagClick(p.tag);}} style={{fontSize:11,fontWeight:700,color:"#111",background:GOLD,padding:"4px 11px",borderRadius:20,flexShrink:0,opacity:activeTag&&activeTag!==p.tag?0.4:1}}>{p.tag}</div>
        {onDelete&&<div className="btn" onClick={e=>{e.stopPropagation();setShowDeleteModal(true);}} style={{width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:C.textDim,fontSize:16,lineHeight:1,background:"transparent",flexShrink:0}}>⋯</div>}
      </div>

      {/* Title */}
      {p.title&&<div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6,lineHeight:1.35}}>{p.title}</div>}

      {/* Body */}
      <div style={{fontSize:15,color:C.textMid,lineHeight:1.75,marginBottom:12}}>
        {compact?p.content.slice(0,105)+"...":(()=>{
          const urlRe=/(https?:\/\/[^\s]+)/g;
          const parts=p.content.split(urlRe);
          return parts.map((part,i)=>urlRe.lastIndex=0||part.match(/^https?:\/\//)
            ?<a key={i} href={part} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{color:GOLD,textDecoration:"underline",wordBreak:"break-all"}}>{part}</a>
            :<span key={i}>{part}</span>
          );
        })()}
      </div>

      {/* Inline media */}
      {!compact&&p.media&&p.media.length>0&&(
        <div style={{marginBottom:14,display:"flex",gap:8,flexDirection:"column"}}>
          {p.media.map((m,mi)=>(
            <div key={mi} style={{borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
              {m.type==="image"&&<img src={m.url} alt={m.name} style={{width:"100%",maxHeight:340,objectFit:"cover",display:"block"}}/>}
              {m.type==="video"&&<video src={m.url} controls style={{width:"100%",maxHeight:340,background:"#000",display:"block"}}/>}
              {m.type==="pdf"&&(
                <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:dark?"#1E1510":"#FFF8F5"}}>
                  <div style={{width:38,height:46,borderRadius:7,background:dark?"#3A1F10":"#FFE8DE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📄</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                    {m.size&&<div style={{fontSize:11,color:C.textDim,marginTop:2}}>{m.size}</div>}
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:GOLD,background:dark?"rgba(226,221,159,0.1)":"rgba(226,221,159,0.25)",padding:"5px 12px",borderRadius:7,border:`1px solid ${GOLD}55`,flexShrink:0}}>View PDF</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Double-tap heart flash */}
      {la&&<div style={{position:"absolute",left:"50%",top:"40%",transform:"translate(-50%,-50%)",fontSize:44,pointerEvents:"none",animation:"lpop .4s ease both",zIndex:10}}>❤️</div>}

      {!compact&&(
        <>
          {/* Action bar */}
          <div style={{display:"flex",alignItems:"center",gap:4,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            <span onClick={e=>{e.stopPropagation();like();}} className={"lbtn"+(la?" lpop":"")}
              style={{position:"relative",display:"flex",alignItems:"center",gap:6,fontSize:13,color:lk?GOLD:C.textDim,
                fontWeight:lk?700:400,userSelect:"none",padding:"5px 10px",borderRadius:8,
                background:lk?(dark?"rgba(226,221,159,0.1)":"rgba(226,221,159,0.15)"):"transparent"}}>
              <Ic.Heart c={lk?GOLD:C.textDim} f={lk} s={15}/>{fmtLikes(p.likes+(lk?1:0))}
              {hintVis&&<div style={{position:"absolute",top:"100%",left:0,fontSize:10,color:C.textDim,opacity:0.45,fontStyle:"italic",whiteSpace:"nowrap",marginTop:2}}>double-tap to like</div>}
            </span>
            <span className="btn" onClick={e=>{e.stopPropagation();setOpen(v=>!v);}}
              style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:open?GOLD:C.textDim,
                fontWeight:open?700:400,padding:"5px 10px",borderRadius:8,
                background:open?(dark?"rgba(226,221,159,0.1)":"rgba(226,221,159,0.15)"):"transparent"}}>
              <Ic.Msg c={open?GOLD:C.textDim} s={13}/>{replies.length}
            </span>
          </div>

          {/* Accordion comments */}
          <div style={{
            maxHeight:open?"600px":"0px",
            overflow:"hidden",
            transition:"max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <div style={{paddingTop:14}}>
              {replies.map((r,i)=>{
                const CommentBubble=()=>{
                  const [expanded,setExpanded]=useState(false);
                  const isLong=r.length>180;
                  return (
                    <div style={{background:C.bgHover,borderRadius:9,padding:"9px 13px",fontSize:13,color:C.textMid,lineHeight:1.6,flex:1,position:"relative",overflow:"hidden",
                      ...(!expanded&&isLong?{maxHeight:62}:{})}}>
                      {r}
                      {isLong&&!expanded&&(
                        <div style={{position:"absolute",bottom:0,left:0,right:0,height:28,background:`linear-gradient(transparent,${dark?"#2E2E2E":"#F5F5F5"})`,display:"flex",alignItems:"flex-end",justifyContent:"flex-end",paddingRight:8,paddingBottom:2}}>
                          <span className="btn" onClick={e=>{e.stopPropagation();setExpanded(true);}} style={{fontSize:11,fontWeight:700,color:GOLD,cursor:"pointer"}}>Read more</span>
                        </div>
                      )}
                    </div>
                  );
                };
                return (
                  <div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:C.bgHover,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.textDim,flexShrink:0}}>?</div>
                    <CommentBubble/>
                  </div>
                );
              })}
              <div style={{display:"flex",gap:9,alignItems:"center",marginTop:4}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:GOLD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#1A1A1A",flexShrink:0}}>CA</div>
                <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:C.bgHover,borderRadius:9,padding:"8px 13px",border:`1px solid ${C.border}`}}>
                  <input value={replyText} onChange={e=>setReply(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitReply()} onClick={e=>e.stopPropagation()} placeholder="Add a reply..." style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:C.text,fontFamily:"'DM Sans',sans-serif"}}/>
                  <span className="btn" onClick={e=>{e.stopPropagation();submitReply();}} style={{opacity:replyText.trim()?1:0.4,pointerEvents:replyText.trim()?"auto":"none"}}><Ic.Send c={replyText.trim()?GOLD:C.textDim} s={14}/></span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}



// ── MEMBER PROFILE PANEL ──────────────────────────────────────────────────
function ProfilePanel({name,dark,C,onClose}){
  const isMe=name==="Coleman Ayers";
  const m=MEMBERS[name];
  const ac=getAC(name);
  const rank=LEADERBOARD.findIndex(l=>l.n===name);
  const pts=LEADERBOARD.find(l=>l.n===name)?.pts??"—";
  const myPosts=POSTS_DATA.filter(p=>p.author===name);

  const [editing,setEditing]=useState(false);
  const [bio,setBio]=useState(m?m.bio:"");
  const [loc,setLoc]=useState(m?m.loc:"");
  const [ig,setIg]=useState(m&&m.ig?m.ig:"");
  const [tw,setTw]=useState(m&&m.tw?m.tw:"");
  const [avatar,setAvatar]=useState(null);
  const [banner,setBanner]=useState(null);
  const avatarRef=useRef(null);
  const bannerRef=useRef(null);

  const CERTS=[
    {id:"l1",label:"BAM Certified — Level 1",color:"#6B9E7A",icon:"🏅"},
    {id:"l2",label:"BAM Certified — Level 2",color:"#9E8A5B",icon:"🥇"},
    {id:"l3",label:"BAM Certified — Level 3",color:GOLD,icon:"⭐"},
    {id:"adapt",label:"ADAPT Global Coach",color:"#5B7FA6",icon:"🌍"},
    {id:"pd",label:"Player Development Specialist",color:"#7A6B9E",icon:"🎯"},
  ];
  const [certs,setCerts]=useState(isMe?["l1","adapt"]:[]);

  if(!m) return null;
  const inp={width:"100%",background:dark?"#2E2E2E":"#F4F4F4",border:`1px solid ${dark?"#3D3D3D":"#E0E0E0"}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:dark?"#F2F2F2":"#111",outline:"none",fontFamily:"'DM Sans',sans-serif"};

  const handleImg=(e,setter)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:480,zIndex:2000,background:dark?"#1E1E1E":"#FFFFFF",borderLeft:`1px solid ${dark?"#333":"#E8E8E8"}`,boxShadow:dark?"-20px 0 60px rgba(0,0,0,0.6)":"-12px 0 40px rgba(0,0,0,0.10)",display:"flex",flexDirection:"column",overflow:"hidden",animation:"profileIn .28s ease both"}}>

      {/* Banner */}
      <div style={{height:120,position:"relative",flexShrink:0}}>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,overflow:"hidden",background:banner?`url(${banner}) center/cover`:(dark?"#242424":"#E8E8E8")}}/>
        {!banner&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:`linear-gradient(135deg,${GOLD}22 0%,transparent 60%)`}}/>}
        {isMe&&editing&&(
          <div className="btn" onClick={()=>bannerRef.current.click()} style={{position:"absolute",bottom:10,right:10,fontSize:11,fontWeight:700,color:"#fff",background:"rgba(0,0,0,0.5)",borderRadius:7,padding:"5px 11px",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.2)"}}>
            Change Banner
          </div>
        )}
        <input ref={bannerRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImg(e,setBanner)}/>
        <div className="btn" onClick={onClose} style={{position:"absolute",top:12,right:12,width:30,height:30,borderRadius:"50%",background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <X size={13} color="#fff"/>
        </div>
        {isMe&&(
          <div className="btn" onClick={()=>setEditing(e=>!e)} style={{position:"absolute",top:12,right:50,fontSize:11,fontWeight:700,color:editing?"#111":"#fff",background:editing?GOLD:"rgba(0,0,0,0.45)",border:`1px solid ${editing?GOLD:"rgba(255,255,255,0.25)"}`,borderRadius:6,padding:"5px 12px",backdropFilter:"blur(4px)"}}>
            {editing?"Done":"Edit Profile"}
          </div>
        )}
        {/* Avatar */}
        <div style={{position:"absolute",bottom:-32,left:24}} onClick={isMe&&editing?()=>avatarRef.current.click():undefined}>
          <div style={{width:72,height:72,borderRadius:"50%",background:avatar?"transparent":ac,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff",border:`3px solid ${dark?"#1E1E1E":"#fff"}`,boxShadow:`0 4px 18px ${ac}66`,overflow:"hidden",cursor:isMe&&editing?"pointer":"default",position:"relative"}}>
            {avatar?<img src={avatar} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="avatar"/>:<span>{m.initials}</span>}
            {isMe&&editing&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}}><span style={{fontSize:9,color:"#fff",fontWeight:700,textAlign:"center",lineHeight:1.3}}>CHANGE<br/>PHOTO</span></div>}
          </div>
          <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImg(e,setAvatar)}/>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{flex:1,overflowY:"auto",padding:"44px 26px 28px"}}>

        {/* Name + location + admin */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:dark?"#F2F2F2":"#111",marginBottom:4}}>{name}</div>
            {!editing&&(
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:dark?"#888":"#999"}}>
                <span style={{fontSize:15}}>{m.flag}</span><span>{loc||m.loc}</span>
              </div>
            )}
          </div>
          {isMe&&<div style={{fontSize:11,fontWeight:800,color:dark?GOLD:"#111",background:dark?"rgba(226,221,159,0.12)":GOLD,border:`1px solid ${dark?GOLD+"45":"transparent"}`,borderRadius:6,padding:"5px 12px",letterSpacing:.8,flexShrink:0}}>ADMIN</div>}
        </div>

        {/* Stats */}
        <div style={{display:"flex",marginBottom:16,background:dark?"#242424":"#F6F6F6",borderRadius:12,overflow:"hidden",border:`1px solid ${dark?"#333":"#E8E8E8"}`}}>
          {[["Posts",m.posts],["Points",pts],["Rank",rank>=0?("#"+(rank+1)):"—"]].map(([label,value],i,a)=>(
            <div key={label} style={{flex:1,textAlign:"center",padding:"13px 0",borderRight:i<a.length-1?`1px solid ${dark?"#333":"#E8E8E8"}`:"none"}}>
              <div style={{fontSize:21,fontWeight:800,color:dark?GOLD:"#111"}}>{value}</div>
              <div style={{fontSize:11,color:dark?"#666":"#aaa",marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        {certs.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:16}}>
            {CERTS.filter(c=>certs.includes(c.id)).map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:c.color,background:c.color+"18",border:`1px solid ${c.color}44`,borderRadius:20,padding:"5px 12px"}}>
                <span style={{fontSize:13}}>{c.icon}</span>{c.label}
              </div>
            ))}
          </div>
        )}

        {/* Socials — clickable when not editing */}
        {!editing&&(ig||tw)&&(
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {ig&&(
              <a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:dark?"#888":"#555",background:dark?"#2A2A2A":"#F0F0F0",padding:"6px 12px",borderRadius:8,fontWeight:600,border:`1px solid ${dark?"#333":"#E8E8E8"}`,textDecoration:"none",cursor:"pointer"}}>
                <Ic.IG c={dark?"#888":"#555"} s={13}/>@{ig}
              </a>
            )}
            {tw&&(
              <a href={`https://x.com/${tw}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:dark?"#888":"#555",background:dark?"#2A2A2A":"#F0F0F0",padding:"6px 12px",borderRadius:8,fontWeight:600,border:`1px solid ${dark?"#333":"#E8E8E8"}`,textDecoration:"none",cursor:"pointer"}}>
                <Ic.TW c={dark?"#888":"#555"} s={12}/>@{tw}
              </a>
            )}
          </div>
        )}

        {/* Bio */}
        {!editing&&<div style={{fontSize:13,color:dark?"#AAA":"#555",lineHeight:1.7,marginBottom:18}}>{bio||m.bio}</div>}

        {/* Edit form */}
        {editing&&(
          <div style={{marginBottom:18,padding:16,borderRadius:12,background:dark?"#242424":"#F8F8F8",border:`1px solid ${dark?"#333":"#E8E8E8"}`}}>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:dark?"#666":"#aaa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Location</div>
              <input value={loc} onChange={e=>setLoc(e.target.value)} style={inp} placeholder="City, Country"/>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:dark?"#666":"#aaa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Bio</div>
              <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} style={{width:"100%",background:dark?"#2E2E2E":"#F4F4F4",border:`1px solid ${dark?"#3D3D3D":"#E0E0E0"}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:dark?"#F2F2F2":"#111",outline:"none",fontFamily:"'DM Sans',sans-serif",resize:"none"}}/>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:dark?"#666":"#aaa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Instagram</div>
              <input value={ig} onChange={e=>setIg(e.target.value)} style={inp} placeholder="username (no @)"/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:dark?"#666":"#aaa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>X / Twitter</div>
              <input value={tw} onChange={e=>setTw(e.target.value)} style={inp} placeholder="username (no @)"/>
            </div>
            {/* Certifications toggle */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:dark?"#666":"#aaa",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Certifications</div>
              {CERTS.map(c=>{
                const on=certs.includes(c.id);
                return(
                  <div key={c.id} className="btn" onClick={()=>setCerts(prev=>on?prev.filter(x=>x!==c.id):[...prev,c.id])}
                    style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",borderRadius:9,marginBottom:6,
                      background:on?c.color+"18":"transparent",
                      border:`1px solid ${on?c.color+"55":(dark?"#333":"#E8E8E8")}`}}>
                    <span style={{fontSize:14}}>{c.icon}</span>
                    <span style={{fontSize:12,fontWeight:600,color:on?c.color:(dark?"#888":"#666"),flex:1}}>{c.label}</span>
                    <div style={{width:18,height:18,borderRadius:"50%",background:on?c.color:"transparent",border:`2px solid ${on?c.color:(dark?"#444":"#ccc")}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {on&&<svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5l2 2 4-4" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="btn" onClick={()=>setEditing(false)} style={{width:"100%",textAlign:"center",padding:"10px 0",background:GOLD,borderRadius:8,fontSize:13,fontWeight:800,color:"#111",boxShadow:`0 4px 14px ${GOLD}44`}}>Save Changes</div>
          </div>
        )}

        {/* Posts tab */}
        <div style={{borderBottom:`1px solid ${dark?"#333":"#E8E8E8"}`,marginBottom:14}}>
          <div style={{display:"inline-block",padding:"9px 16px",fontSize:13,fontWeight:700,color:dark?GOLD:"#111",borderBottom:`2px solid ${GOLD}`,marginBottom:-1}}>Posts ({myPosts.length})</div>
        </div>

        {myPosts.length===0
          ?<div style={{textAlign:"center",padding:"40px 0",color:dark?"#555":"#bbb",fontSize:13}}>No posts yet.</div>
          :myPosts.map(p=>{
            const border=getCardBorder(p.id);
            return(
              <div key={p.id} style={{background:dark?"#242424":"#F8F8F8",border:`1px solid ${dark?"#333":"#E8E8E8"}`,borderLeft:`3px solid ${border}`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#111",background:GOLD,padding:"2px 9px",borderRadius:10}}>{p.tag}</div>
                  <div style={{fontSize:11,color:dark?"#555":"#aaa"}}>{p.time}</div>
                  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,fontSize:12,color:dark?"#555":"#bbb"}}>
                    <span style={{display:"flex",alignItems:"center",gap:4}}><Ic.Heart c={dark?"#555":"#bbb"} s={11}/>{p.likes}</span>
                    <span style={{display:"flex",alignItems:"center",gap:4}}><Ic.Msg c={dark?"#555":"#bbb"} s={11}/>{p.replies.length}</span>
                  </div>
                </div>
                <div style={{fontSize:13,color:dark?"#B0B0B0":"#444",lineHeight:1.65}}>{p.content}</div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}


// ── REAL 3D GLOBE ────────────────────────────────────────────────────────────
function Globe({ dark }) {
  const canvasRef = useRef(null);
  const rotRef = useRef(0);
  const rafRef = useRef(null);
  const [ready, setReady] = useState(false);
  const geoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAndDraw() {
      try {
        // Fetch low-res world geo from CDN
        const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const world = await res.json();
        if (cancelled) return;
        geoRef.current = world;
        setReady(true);
      } catch(e) {
        console.error("Globe fetch failed", e);
      }
    }
    loadAndDraw();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const R = W * 0.46;
    const cx = W / 2, cy = H / 2;
    const goldColor = dark ? "rgba(226,221,159," : "rgba(180,170,80,";
    const world = geoRef.current;

    // Convert topojson to geojson features
    // Manual topojson decode for countries
    function decodeArcs(topology, arcs) {
      const scale = topology.transform?.scale || [1,1];
      const translate = topology.transform?.translate || [0,0];
      return arcs.map(arcIdx => {
        const reversed = arcIdx < 0;
        const idx = reversed ? ~arcIdx : arcIdx;
        const arc = topology.arcs[idx];
        let x = 0, y = 0;
        const pts = arc.map(([dx, dy]) => {
          x += dx; y += dy;
          return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
        });
        return reversed ? pts.reverse() : pts;
      });
    }

    function topoToGeo(topology, objectName) {
      const obj = topology.objects[objectName];
      return obj.geometries.map(geom => {
        if (geom.type === "Polygon") {
          return { type:"Polygon", arcs: geom.arcs.map(ring => decodeArcs(topology, ring)) };
        } else if (geom.type === "MultiPolygon") {
          return { type:"MultiPolygon", arcs: geom.arcs.map(poly => poly.map(ring => decodeArcs(topology, ring))) };
        }
        return null;
      }).filter(Boolean);
    }

    // Project lon/lat to canvas x/y given rotation
    function project(lon, lat, rotY) {
      const lam = (lon + rotY) * Math.PI / 180;
      const phi = lat * Math.PI / 180;
      // Orthographic projection
      const cosC = Math.sin(0) * Math.sin(phi) + Math.cos(0) * Math.cos(phi) * Math.cos(lam);
      if (cosC < 0) return null; // behind globe
      const x = cx + R * Math.cos(phi) * Math.sin(lam);
      const y = cy - R * (Math.cos(0) * Math.sin(phi) - Math.sin(0) * Math.cos(phi) * Math.cos(lam));
      return [x, y];
    }

    function drawPath(ctx, ringPts, rotY) {
      let started = false;
      ctx.beginPath();
      for (const [lon, lat] of ringPts) {
        const p = project(lon, lat, rotY);
        if (!p) { started = false; continue; }
        if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
    }

    const countries = topoToGeo(world, "countries");

    function draw(rot) {
      ctx.clearRect(0, 0, W, H);

      // Globe base sphere
      const gradient = ctx.createRadialGradient(cx - R*0.25, cy - R*0.25, R*0.05, cx, cy, R);
      if (dark) {
        gradient.addColorStop(0, "rgba(60,58,40,0.18)");
        gradient.addColorStop(1, "rgba(20,18,8,0.12)");
      } else {
        gradient.addColorStop(0, "rgba(240,235,180,0.15)");
        gradient.addColorStop(1, "rgba(200,190,120,0.06)");
      }
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sphere edge
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = goldColor + "0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Graticule (lat/lon grid)
      ctx.strokeStyle = goldColor + "0.14)";
      ctx.lineWidth = 0.6;
      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 2) {
          const p = project(lon, lat, rot);
          if (!p) { started = false; continue; }
          if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
          else ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
      }
      // Longitude lines
      for (let lon = -180; lon < 180; lon += 20) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = project(lon, lat, rot);
          if (!p) { started = false; continue; }
          if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
          else ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
      }

      // Country fills + outlines
      for (const country of countries) {
        const polys = country.type === "Polygon" ? [country.arcs] : country.arcs;
        for (const poly of polys) {
          const outer = poly[0];
          drawPath(ctx, outer, rot);
          ctx.fillStyle = goldColor + "0.18)";
          ctx.fill();
          ctx.strokeStyle = goldColor + "0.55)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    function animate() {
      rotRef.current = (rotRef.current - 0.12) % 360;
      draw(rotRef.current);
      rafRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, dark]);

  return (
    <div style={{
      position:"absolute",
      top:"50%", left:"50%",
      transform:"translate(-50%,-50%)",
      width:"min(90vw,680px)", height:"min(90vw,680px)",
      pointerEvents:"none", zIndex:0,
      opacity: dark ? 0.62 : 0.38,
    }}>
      {!ready && (
        <div style={{width:"100%",height:"100%",borderRadius:"50%",border:"1px solid rgba(226,221,159,0.15)"}}/>
      )}
      {ready && (
        <canvas ref={canvasRef} width={680} height={680}
          style={{width:"100%",height:"100%",borderRadius:"50%"}}
        />
      )}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────



// ─── PLAYBOOK BUILDER ────────────────────────────────────────────────────────

const DRAW_COLORS = ["#FFFFFF","#AAAAAA",GOLD];
const COURT_W = 680;
const COURT_H = 400;

const PLAY_TYPES   = ["Set Play","BLOB","SLOB","Concept"];
const PLAY_LEVELS  = ["Basic","Intermediate","Advanced","All Levels"];

const DRAW_TOOLS = [
  { id:"select",  label:"Select",  icon:"↖" },
  { id:"arrow",   label:"Arrow",   icon:"→" },
  { id:"dribble", label:"Dribble", icon:"⤳" },
  { id:"screen",  label:"Screen",  icon:"▬" },
  { id:"erase",   label:"Erase",   icon:"✕" },
];

const PUBLIC_PLAYBOOKS = [
  { id:1, author:"Coach Rivera",   avatar:"CR", team:"Miami Elite",  plays:6, title:"Half-Court Sets",    desc:"Structured half-court offense with 3 baseline actions.", likes:48, tags:["Set Play","Intermediate"] },
  { id:2, author:"Coach Williams", avatar:"CW", team:"ATL Rising",   plays:4, title:"Press Break Series", desc:"4 clean press break progressions vs full-court pressure.", likes:31, tags:["Concept","Basic"] },
  { id:3, author:"Coach Okafor",   avatar:"CO", team:"BAM Academy",  plays:8, title:"Transition Offense", desc:"Push pace concepts — numbered fast break + secondary.",  likes:62, tags:["Concept","Advanced"] },
  { id:4, author:"Coach Santos",   avatar:"CS", team:"NYC Hoopers",   plays:5, title:"Zone Attack Plays",  desc:"5 zone attack sets vs 2-3, focusing on skip passing.",   likes:27, tags:["SLOB","Intermediate"] },
];


// Pre-load court background image
let COURT_BG_LOADED = false;
const COURT_BG_IMG = new Image();
let COURT_BG_FAILED = false;
COURT_BG_IMG.onload = () => { COURT_BG_LOADED = true; };
COURT_BG_IMG.onerror = () => { COURT_BG_FAILED = true; };
COURT_BG_IMG.src = "/images/court-reference.png";

function drawCourtFallbackLines(ctx, w, h, lineColor) {
  ctx.strokeStyle = lineColor; ctx.lineWidth = 1.5;
  // Outer boundary
  ctx.strokeRect(20, 10, w-40, h-20);
  // Half-court line
  ctx.beginPath(); ctx.moveTo(w/2, 10); ctx.lineTo(w/2, h-10); ctx.stroke();
  // Center circle
  ctx.beginPath(); ctx.arc(w/2, h/2, 36, 0, Math.PI*2); ctx.stroke();
  // Left key
  ctx.strokeRect(20, h/2-55, 110, 110);
  // Right key
  ctx.strokeRect(w-130, h/2-55, 110, 110);
  // Left FT circle
  ctx.beginPath(); ctx.arc(130, h/2, 36, 0, Math.PI*2); ctx.stroke();
  // Right FT circle
  ctx.beginPath(); ctx.arc(w-130, h/2, 36, 0, Math.PI*2); ctx.stroke();
  // Left 3pt arc
  ctx.beginPath(); ctx.arc(55, h/2, 120, -Math.PI*0.42, Math.PI*0.42); ctx.stroke();
  // Right 3pt arc
  ctx.beginPath(); ctx.arc(w-55, h/2, 120, Math.PI-Math.PI*0.42, Math.PI+Math.PI*0.42); ctx.stroke();
}

function drawCourt(ctx, w, h, dark, igHandle, xHandle) {
  // Fill court surface
  ctx.fillStyle = dark ? "#2A2A2A" : "#F0EBE0";
  ctx.fillRect(0, 0, w, h);

  // Draw court lines from reference image, tinted for current theme
  if (!COURT_BG_FAILED && (COURT_BG_LOADED || COURT_BG_IMG.complete)) {
    const off = document.createElement("canvas");
    off.width = w; off.height = h;
    const ox = off.getContext("2d");
    ox.drawImage(COURT_BG_IMG, 0, 0, w, h);
    ox.globalCompositeOperation = "source-in";
    ox.fillStyle = dark ? "#FFFFFF" : "#111111";
    ox.fillRect(0, 0, w, h);
    ox.globalCompositeOperation = "source-over";
    ctx.drawImage(off, 0, 0);
  } else {
    // Fallback: draw basic court lines
    drawCourtFallbackLines(ctx, w, h, dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)");
  }

  // Social handles
  if (igHandle || xHandle) {
    ctx.save();
    ctx.font = "600 9.5px monospace";
    ctx.fillStyle = dark ? "rgba(226,221,159,0.5)" : "rgba(0,0,0,0.45)";
    ctx.textBaseline = "bottom";
    let tx = 24;
    if (igHandle) {
      ctx.textAlign = "left";
      ctx.fillText("IG @" + igHandle, tx, h - 23);
      tx += ctx.measureText("IG @" + igHandle).width + 12;
    }
    if (xHandle) {
      ctx.textAlign = "left";
      ctx.fillText("X @" + xHandle, tx, h - 23);
    }
    ctx.restore();
  }
}


// Draw a single player circle
function drawPlayer(ctx, obj, selected, dark) {
  ctx.save();
  const r = 14;
  // Drop shadow
  ctx.beginPath(); ctx.arc(obj.x+1.5, obj.y+2.5, r, 0, Math.PI*2);
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fill();
  // Selection glow
  if (selected) { ctx.shadowColor=GOLD; ctx.shadowBlur=14; }
  // Main circle
  const baseColor = obj.color||"#fff";
  ctx.beginPath(); ctx.arc(obj.x, obj.y, r, 0, Math.PI*2);
  ctx.fillStyle = baseColor; ctx.fill();
  // 3D rim / edge gradient
  ctx.shadowColor="transparent"; ctx.shadowBlur=0;
  const rim = ctx.createRadialGradient(obj.x-3, obj.y-3, r*0.3, obj.x, obj.y, r);
  rim.addColorStop(0, "rgba(255,255,255,0.25)");
  rim.addColorStop(0.7, "rgba(255,255,255,0)");
  rim.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.beginPath(); ctx.arc(obj.x, obj.y, r, 0, Math.PI*2);
  ctx.fillStyle = rim; ctx.fill();
  // Border
  ctx.strokeStyle = dark?"#111":"#333"; ctx.lineWidth=2; ctx.stroke();
  // Label
  const textCol = (baseColor==="#FFFFFF"||baseColor==="#fff"||baseColor===GOLD) ? "#111" : "#fff";
  ctx.fillStyle=textCol; ctx.font="bold 11px sans-serif";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(obj.label||"?", obj.x, obj.y);
  ctx.restore();
}

function drawBall(ctx, x, y, selected) {
  ctx.save();
  const r = 10;
  // Drop shadow
  ctx.beginPath(); ctx.arc(x+1, y+2, r, 0, Math.PI*2);
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fill();
  // Selection glow
  if (selected) { ctx.shadowColor="#E8762A"; ctx.shadowBlur=14; }
  // Solid orange fill with subtle shading
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
  const bg = ctx.createRadialGradient(x-2, y-2, 1, x, y, r);
  bg.addColorStop(0, "#F09030");
  bg.addColorStop(0.7, "#E8762A");
  bg.addColorStop(1, "#C45A18");
  ctx.fillStyle = bg; ctx.fill();
  ctx.strokeStyle="#8B3A00"; ctx.lineWidth=1; ctx.stroke();
  ctx.shadowColor="transparent"; ctx.shadowBlur=0;
  // Clip seams to ball circle
  ctx.beginPath(); ctx.arc(x, y, r-0.5, 0, Math.PI*2); ctx.clip();
  ctx.strokeStyle="rgba(20,5,0,0.55)"; ctx.lineWidth=0.9;
  // Vertical center seam
  ctx.beginPath(); ctx.moveTo(x, y-r); ctx.lineTo(x, y+r); ctx.stroke();
  // Top curved seam (arc bowing upward)
  ctx.beginPath();
  ctx.moveTo(x-r, y);
  ctx.bezierCurveTo(x-r*0.5, y-r*0.75, x+r*0.5, y-r*0.75, x+r, y);
  ctx.stroke();
  // Bottom curved seam (arc bowing downward)
  ctx.beginPath();
  ctx.moveTo(x-r, y);
  ctx.bezierCurveTo(x-r*0.5, y+r*0.75, x+r*0.5, y+r*0.75, x+r, y);
  ctx.stroke();
  // Shine highlight dot
  ctx.beginPath(); ctx.arc(x-r*0.35, y-r*0.35, r*0.22, 0, Math.PI*2);
  ctx.fillStyle="rgba(255,255,255,0.45)"; ctx.fill();
  ctx.restore();
}

function drawArrowPath(ctx, pts, col, dashed) {
  if (!pts||pts.length<2) return;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
  if (dashed) ctx.setLineDash([7,5]);
  for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
  ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.stroke();
  ctx.setLineDash([]);
  const last=pts[pts.length-1], prev=pts[pts.length-2];
  const angle=Math.atan2(last.y-prev.y,last.x-prev.x);
  ctx.beginPath();
  ctx.moveTo(last.x,last.y);
  ctx.lineTo(last.x-13*Math.cos(angle-.42),last.y-13*Math.sin(angle-.42));
  ctx.lineTo(last.x-13*Math.cos(angle+.42),last.y-13*Math.sin(angle+.42));
  ctx.closePath(); ctx.fillStyle=col; ctx.fill();
  ctx.restore();
}

function drawScreen(ctx, x, y, col, rot, selected) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate((rot||0)*Math.PI/180);
  const sw=30, sh=10;
  // Drop shadow
  ctx.fillStyle="rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.roundRect(-sw/2+2, -sh/2+3, sw, sh, 3);
  ctx.fill();
  // Selection glow
  if (selected) { ctx.shadowColor=GOLD; ctx.shadowBlur=12; }
  // Main body
  ctx.beginPath();
  ctx.roundRect(-sw/2, -sh/2, sw, sh, 3);
  ctx.fillStyle = col; ctx.fill();
  // 3D top bevel
  ctx.shadowColor="transparent"; ctx.shadowBlur=0;
  ctx.beginPath();
  ctx.roundRect(-sw/2, -sh/2, sw, sh*0.45, [3,3,0,0]);
  ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.fill();
  // Border
  ctx.beginPath();
  ctx.roundRect(-sw/2, -sh/2, sw, sh, 3);
  ctx.strokeStyle="rgba(0,0,0,0.35)"; ctx.lineWidth=1.2; ctx.stroke();
  ctx.restore();
}

// ── PlayCanvas ─────────────────────────────────────────────────────────────
function PlayCanvas({ play, stageIdx, onUpdate, C, dark, readOnly, animProgress, prevStageObjs, igHandle, xHandle, onNextStage }) {
  const courtRef  = useRef(null);
  const overlayRef = useRef(null);
  const [tool, setTool]     = useState("select");
  const [color, setColor]   = useState(DRAW_COLORS[2]);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [history, setHistory]   = useState([]);
  const [histIdx, setHistIdx]   = useState(-1);
  const nextId = useRef(Date.now());
  const [playerLimitMsg, setPlayerLimitMsg] = useState("");
  const [courtImgFailed, setCourtImgFailed] = useState(false);

  const players  = play?.players  || [];
  const ball     = play?.ball     || null;
  const drawings = play?.stages?.[stageIdx]?.drawings || [];

  // Prompt 1: count offensive/defensive
  const offCount = players.filter(p=>!p.label.startsWith("X")).length;
  const defCount = players.filter(p=>p.label.startsWith("X")).length;

  const pushHist = useCallback((newPlay) => {
    setHistory(prev => { const h=[...prev.slice(0,histIdx+1),newPlay]; setHistIdx(h.length-1); return h; });
    onUpdate && onUpdate(newPlay);
  }, [histIdx, onUpdate]);

  // Prompt 6: undo silently ignores at beginning
  const undo = useCallback(() => {
    if (histIdx<=0) return; // silently do nothing
    const ni=histIdx-1;
    setHistIdx(ni);
    onUpdate && onUpdate(history[ni]);
  },[histIdx,history,onUpdate]);

  const redrawCourt = useCallback(() => {
    const cv=courtRef.current; if(!cv) return;
    drawCourt(cv.getContext("2d"), COURT_W, COURT_H, dark, igHandle, xHandle);
  }, [dark, igHandle, xHandle]);

  useEffect(() => {
    redrawCourt();
    if (!COURT_BG_LOADED && !COURT_BG_FAILED) {
      const prev = COURT_BG_IMG.onload;
      COURT_BG_IMG.onload = () => { COURT_BG_LOADED = true; redrawCourt(); if(prev) prev(); };
      COURT_BG_IMG.onerror = () => { COURT_BG_FAILED = true; redrawCourt(); };
    }
  }, [redrawCourt]);

  // Draw everything
  useEffect(() => {
    const cv=overlayRef.current; if(!cv) return;
    const ctx=cv.getContext("2d");
    ctx.clearRect(0,0,COURT_W,COURT_H);

    const t = (animProgress!=null) ? animProgress : 1;

    // Draw screens for current stage
    drawings.forEach(obj => {
      if (obj.type==="screen") drawScreen(ctx, obj.x, obj.y, obj.color, obj.rot, obj.id===selected);
    });

    // Ghost movement lines during animation
    if (animProgress!=null && prevStageObjs) {
      players.forEach(pl => {
        const prevPos = prevStageObjs.playerPositions?.[pl.id];
        const curPos  = pl.positions?.[stageIdx] || prevPos;
        if (prevPos && curPos && (prevPos.x!==curPos.x||prevPos.y!==curPos.y)) {
          ctx.save();
          ctx.setLineDash([5,4]);
          ctx.strokeStyle="rgba(226,221,159,0.3)";
          ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(prevPos.x,prevPos.y); ctx.lineTo(curPos.x,curPos.y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      });
      if (prevStageObjs.ballPos && ball?.positions?.[stageIdx]) {
        const bp=prevStageObjs.ballPos, cp=ball.positions[stageIdx];
        if (bp.x!==cp.x||bp.y!==cp.y) {
          ctx.save();
          ctx.setLineDash([5,4]);
          ctx.strokeStyle="rgba(232,118,42,0.4)"; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(bp.x,bp.y); ctx.lineTo(cp.x,cp.y); ctx.stroke();
          ctx.setLineDash([]); ctx.restore();
        }
      }
    }

    // Players — interpolated position during animation
    players.forEach(pl => {
      const curPos  = pl.positions?.[stageIdx];
      const prevPos = prevStageObjs?.playerPositions?.[pl.id];
      let x,y;
      if (animProgress!=null && prevPos && curPos) {
        x = prevPos.x + (curPos.x-prevPos.x)*t;
        y = prevPos.y + (curPos.y-prevPos.y)*t;
      } else {
        x = curPos?.x ?? (pl.positions?.[0]?.x ?? 100);
        y = curPos?.y ?? (pl.positions?.[0]?.y ?? 200);
      }
      drawPlayer(ctx, {...pl,x,y}, pl.id===selected, dark);
    });

    // Ball
    if (ball) {
      const curPos  = ball.positions?.[stageIdx];
      const prevPos = prevStageObjs?.ballPos;
      let bx,by;
      if (animProgress!=null && prevPos && curPos) {
        bx = prevPos.x+(curPos.x-prevPos.x)*t;
        by = prevPos.y+(curPos.y-prevPos.y)*t;
      } else {
        bx = curPos?.x ?? ball.positions?.[0]?.x ?? 200;
        by = curPos?.y ?? ball.positions?.[0]?.y ?? 200;
      }
      drawBall(ctx, bx, by, selected==="ball");
    }

  },[players,ball,drawings,selected,dark,animProgress,prevStageObjs,stageIdx]);

  const getPos = (e) => {
    const r=overlayRef.current.getBoundingClientRect();
    const sx=COURT_W/r.width, sy=COURT_H/r.height;
    const cx=e.touches?e.touches[0].clientX:e.clientX;
    const cy=e.touches?e.touches[0].clientY:e.clientY;
    return { x:(cx-r.left)*sx, y:(cy-r.top)*sy };
  };

  const hitTestEl = (pos) => {
    if (ball) {
      const bp=ball.positions?.[stageIdx]||ball.positions?.[0]||{x:0,y:0};
      if (Math.hypot(pos.x-bp.x,pos.y-bp.y)<16) return {id:"ball",type:"ball"};
    }
    for (let i=players.length-1;i>=0;i--) {
      const pl=players[i];
      const pp=pl.positions?.[stageIdx]||pl.positions?.[0]||{x:0,y:0};
      if (Math.hypot(pos.x-pp.x,pos.y-pp.y)<18) return {id:pl.id,type:"player"};
    }
    for (let i=drawings.length-1;i>=0;i--) {
      const d=drawings[i];
      if (d.type==="screen" && Math.hypot(pos.x-d.x,pos.y-d.y)<20) return {id:d.id,type:"screen"};
    }
    return null;
  };

  const onDown = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const pos=getPos(e);

    if (tool==="select") {
      const hit=hitTestEl(pos);
      setSelected(hit?hit.id:null);
      if (hit) setDragging(hit);
    } else if (tool==="screen") {
      const id=nextId.current++;
      const newD=[...drawings,{id,type:"screen",x:pos.x,y:pos.y,color,rot:0}];
      pushHist(setStageDrawings(play,stageIdx,newD));
    }
  };

  const onMove = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const pos=getPos(e);
    if (dragging) {
      let newPlay=moveElement(play,dragging,stageIdx,pos);
      if (dragging.type==="player" && ball) {
        const playerPrevPos = play.players.find(p=>p.id===dragging.id)?.positions?.[stageIdx] || play.players.find(p=>p.id===dragging.id)?.positions?.[0];
        const ballCurPos = ball.positions?.[stageIdx] || ball.positions?.[0];
        if (playerPrevPos && ballCurPos) {
          const dx=Math.abs(playerPrevPos.x-ballCurPos.x);
          const dy=Math.abs(playerPrevPos.y-ballCurPos.y);
          if (dx<18 && dy<18) {
            const ballPositions={...ball.positions,[stageIdx]:pos};
            newPlay={...newPlay,ball:{...newPlay.ball,positions:ballPositions}};
          }
        }
      }
      onUpdate && onUpdate(newPlay);
    }
  };

  const onUp = (e) => {
    if (readOnly) return;
    if (dragging) { pushHist(play); setDragging(null); }
  };

  // Prompt 1: addPlayer removed — use addOffensivePlayer/addDefensivePlayer instead

  const addBall = () => {
    if (ball) return; // Prompt 3: only one ball
    const cx_=COURT_W/2, cy_=COURT_H/2;
    const positions={};
    const stageCount=play?.stages?.length||1;
    for(let i=0;i<stageCount;i++) positions[i]={x:cx_,y:cy_};
    pushHist({...play,ball:{positions}});
  };

  // Prompt 2.1: deleteSelected only deletes screens and ball, not players
  const deleteSelected = () => {
    if (!selected) return;
    if (selected==="ball") { pushHist({...play,ball:null}); setSelected(null); return; }
    // Check if it's a screen — only screens can be deleted individually
    const screenMatch = drawings.find(d=>d.id===selected&&d.type==="screen");
    if (screenMatch) {
      const newD=drawings.filter(d=>d.id!==selected);
      pushHist(setStageDrawings(play,stageIdx,newD));
      setSelected(null);
      return;
    }
    // Players cannot be deleted individually — silently do nothing
  };

  const rotateScreen = () => {
    const newD=drawings.map(d=>d.type==="screen"&&d.id===selected?{...d,rot:(d.rot||0)+45}:d);
    pushHist(setStageDrawings(play,stageIdx,newD));
  };

  const selectedIsScreen = drawings.find(d=>d.id===selected&&d.type==="screen");

  const addOffensivePlayer = useCallback(() => {
    if (readOnly) return;
    if (offCount>=5) { setPlayerLimitMsg("Maximum 5 offensive players"); setTimeout(()=>setPlayerLimitMsg(""),2500); return; }
    const oLabels=["1","2","3","4","5"];
    const cx_=COURT_W/2, cy_=COURT_H/2;
    const positions={};
    const stageCount=play?.stages?.length||1;
    const offset=(offCount%5)*25-50;
    for(let i=0;i<stageCount;i++) positions[i]={x:cx_+offset,y:cy_};
    const id=nextId.current++;
    pushHist({...play,players:[...players,{id,label:oLabels[offCount],color:DRAW_COLORS[0],positions}]});
  },[readOnly,players,play,pushHist,offCount]);

  const addDefensivePlayer = useCallback(() => {
    if (readOnly) return;
    if (defCount>=5) { setPlayerLimitMsg("Maximum 5 defensive players"); setTimeout(()=>setPlayerLimitMsg(""),2500); return; }
    const cx_=COURT_W/2, cy_=COURT_H/2;
    const positions={};
    const stageCount=play?.stages?.length||1;
    const offset=(defCount%5)*25-50;
    for(let i=0;i<stageCount;i++) positions[i]={x:cx_+offset,y:cy_+30};
    const id=nextId.current++;
    pushHist({...play,players:[...players,{id,label:"X"+(defCount+1),color:"#E06060",positions}]});
  },[readOnly,players,play,pushHist,defCount]);

  // Keyboard shortcuts
  useEffect(() => {
    if (readOnly) return;
    const handler = (e) => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT") return;
      if (e.key==="n"||e.key==="N") { e.preventDefault(); addOffensivePlayer(); }
      else if (e.key==="d"||e.key==="D") { e.preventDefault(); addDefensivePlayer(); }
      else if (e.key==="Enter") { e.preventDefault(); onNextStage && onNextStage(); }
      else if ((e.metaKey||e.ctrlKey)&&e.key==="z") { e.preventDefault(); undo(); }
      else if (e.key==="Delete"||e.key==="Backspace") { e.preventDefault(); deleteSelected(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  },[readOnly,addOffensivePlayer,addDefensivePlayer,onNextStage,undo,deleteSelected]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {!readOnly && (
        <>
          {/* Toolbar */}
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:3,background:dark?"#111":"#e8e8e8",borderRadius:10,padding:3}}>
              <button onClick={()=>{setTool("select");}}
                style={{padding:"5px 9px",borderRadius:7,border:"none",cursor:"pointer",
                  fontSize:12,fontWeight:700,whiteSpace:"nowrap",transition:"all .15s",
                  background:tool==="select"?GOLD:"transparent",
                  color:tool==="select"?"#111":(dark?"#888":"#555")}}>
                ✋ Drag
              </button>
              <button onClick={()=>{setTool(tool==="screen"?"select":"screen");}}
                style={{padding:"5px 9px",borderRadius:7,border:"none",cursor:"pointer",
                  fontSize:12,fontWeight:700,whiteSpace:"nowrap",transition:"all .15s",
                  background:tool==="screen"?GOLD:"transparent",
                  color:tool==="screen"?"#111":(dark?"#888":"#555")}}>
                ▬ Screen
              </button>
            </div>
            {tool==="screen" && (
              <div style={{display:"flex",gap:5}}>
                {DRAW_COLORS.map(cl=>(
                  <div key={cl} onClick={()=>setColor(cl)}
                    style={{width:18,height:18,borderRadius:"50%",background:cl,cursor:"pointer",
                      border:color===cl?`2px solid ${GOLD}`:"2px solid transparent",
                      outline:color===cl?`1px solid rgba(0,0,0,0.4)`:"none",
                      transition:"all .15s"}}/>
                ))}
              </div>
            )}
            <div style={{marginLeft:"auto",display:"flex",gap:5}}>
              <button onClick={undo}
                style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${dark?"#333":"#ccc"}`,cursor:"pointer",
                  background:"transparent",color:dark?"#888":"#666",fontSize:12,fontWeight:700}}>
                ↩ Undo
              </button>
              {selected && (
                <>
                  {selectedIsScreen && (
                    <button onClick={rotateScreen}
                      style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${GOLD}`,cursor:"pointer",
                        background:"transparent",color:GOLD,fontSize:12,fontWeight:700}}>
                      ↻ Rotate
                    </button>
                  )}
                  <button onClick={deleteSelected}
                    style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",
                      background:"rgba(220,60,60,0.15)",color:"#e07070",fontSize:12,fontWeight:700}}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Add elements row */}
          <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:11,fontWeight:700,color:C.textDim,textTransform:"uppercase",letterSpacing:.8}}>Add:</span>
            <button onClick={addOffensivePlayer}
              style={{padding:"4px 12px",borderRadius:7,border:`1px solid ${offCount>=5?"transparent":C.border}`,
                background:offCount>=5?(dark?"rgba(255,255,255,0.04)":"#f5f5f5"):"transparent",
                color:offCount>=5?C.textDim:C.textMid,fontSize:12,fontWeight:700,
                cursor:offCount>=5?"not-allowed":"pointer",opacity:offCount>=5?0.5:1}}>
              ● Offense ({offCount}/5)
            </button>
            <button onClick={addDefensivePlayer}
              style={{padding:"4px 12px",borderRadius:7,border:`1px solid ${defCount>=5?"transparent":C.border}`,
                background:defCount>=5?(dark?"rgba(255,255,255,0.04)":"#f5f5f5"):"transparent",
                color:defCount>=5?C.textDim:"#E06060",fontSize:12,fontWeight:700,
                cursor:defCount>=5?"not-allowed":"pointer",opacity:defCount>=5?0.5:1}}>
              ✕ Defense ({defCount}/5)
            </button>
            {!ball && (
              <button onClick={addBall}
                style={{padding:"4px 12px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",
                  color:C.textMid,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                ◉ Ball
              </button>
            )}
            {playerLimitMsg && (
              <span style={{fontSize:12,color:"#e07070",fontWeight:600,marginLeft:4}}>{playerLimitMsg}</span>
            )}
            <span style={{fontSize:12,color:C.textDim,marginLeft:4}}>
              {tool==="screen"?"Click court to place a screen.":"Drag players and ball to position them. Press Enter for next stage."}
            </span>
          </div>
        </>
      )}
      {/* Canvas */}
      <div style={{position:"relative",width:"100%",borderRadius:12,overflow:"hidden",
        border:`1px solid ${dark?"#2a2a2a":"#bbb"}`,
        boxShadow:dark?"0 6px 32px rgba(0,0,0,0.6)":"0 4px 18px rgba(0,0,0,0.15)"}}>
        <canvas ref={courtRef} width={COURT_W} height={COURT_H} style={{display:"block",width:"100%",height:"auto"}}/>
        <canvas ref={overlayRef} width={COURT_W} height={COURT_H}
          style={{position:"absolute",top:0,left:0,width:"100%",height:"auto",
            cursor:readOnly?"default":tool==="select"?"grab":"crosshair"}}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}/>
      </div>
      {!readOnly && (
        <div style={{display:"flex",gap:12,flexWrap:"wrap",opacity:0.5,fontSize:10,color:C.textDim,marginTop:2}}>
          {[["N","Add offense"],["D","Add defense"],["Enter","Next stage"],["\u2318Z","Undo"],["Del","Delete selected"]].map(([k,v])=>(
            <span key={k}><kbd style={{background:dark?"#222":"#e0e0e0",padding:"1px 4px",borderRadius:3,fontFamily:"monospace",fontSize:10,border:`1px solid ${dark?"#333":"#ccc"}`}}>{k}</kbd> {v}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function setStageDrawings(play, stageIdx, drawings) {
  const stages = [...(play.stages||[{}])];
  while (stages.length<=stageIdx) stages.push({drawings:[]});
  stages[stageIdx]={...stages[stageIdx],drawings};
  return {...play,stages};
}

function clampToCourtBounds(pos, radius=14) {
  return { x: Math.max(radius, Math.min(COURT_W-radius, pos.x)), y: Math.max(radius, Math.min(COURT_H-radius, pos.y)) };
}

function snapOverlap(play, movedId, stageIdx, pos) {
  const players = play.players || [];
  let adjusted = {...pos};
  players.forEach(pl => {
    if (pl.id === movedId) return;
    const other = pl.positions?.[stageIdx] || pl.positions?.[0] || {x:0,y:0};
    const dist = Math.hypot(adjusted.x - other.x, adjusted.y - other.y);
    if (dist < 6) {
      const angle = Math.atan2(adjusted.y - other.y, adjusted.x - other.x) || Math.PI/4;
      adjusted = { x: other.x + Math.cos(angle)*16, y: other.y + Math.sin(angle)*16 };
    }
  });
  return clampToCourtBounds(adjusted);
}

function moveElement(play, dragging, stageIdx, pos) {
  if (dragging.type==="ball") {
    const clamped = clampToCourtBounds(pos, 10);
    const positions={...play.ball?.positions,[stageIdx]:clamped};
    return {...play,ball:{...play.ball,positions}};
  }
  if (dragging.type==="player") {
    const snapped = snapOverlap(play, dragging.id, stageIdx, pos);
    const players=play.players.map(pl=>{
      if (pl.id!==dragging.id) return pl;
      return {...pl,positions:{...pl.positions,[stageIdx]:snapped}};
    });
    return {...play,players};
  }
  if (dragging.type==="screen") {
    const clamped = clampToCourtBounds(pos, 15);
    const stages=[...(play.stages||[{}])];
    while (stages.length<=stageIdx) stages.push({drawings:[]});
    const drawings=(stages[stageIdx].drawings||[]).map(d=>
      d.id===dragging.id?{...d,x:clamped.x,y:clamped.y}:d
    );
    stages[stageIdx]={...stages[stageIdx],drawings};
    return {...play,stages};
  }
  return play;
}

function easeInOut(t) { return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

// ── PlaybookBuilder ────────────────────────────────────────────────────────
function PlaybookBuilder({ C, dark }) {
  const [view, setView]             = useState("mine");
  const [myBooks, setMyBooks]       = useState([
    { id:1, title:"My Half-Court Sets", type:"Set Play", level:"Intermediate",
      notes:"Primary half-court set for late-game situations.",
      plays:[{ id:1, name:"Play 1", players:[], ball:null, stages:[{drawings:[]}] }],
      updatedAt:"2d ago" },
  ]);
  const [activeBook, setActiveBook] = useState(null);
  const [activePlayIdx, setActivePlayIdx] = useState(0);
  const [stageIdx, setStageIdx]     = useState(0);
  const [newBookName, setNewBookName] = useState("");
  const [showNewBook, setShowNewBook] = useState(false);
  const [animProgress, setAnimProgress] = useState(null);
  const [prevStageObjs, setPrevStageObjs] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showNotes, setShowNotes]   = useState(false);
  const [igHandle, setIgHandle]     = useState("");
  const [xHandle, setXHandle]       = useState("");
  const [showIg, setShowIg]         = useState(false);
  const [showX, setShowX]           = useState(false);
  const animFrameRef = useRef(null);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [loopPlay, setLoopPlay] = useState(false);
  // Prompt 9: walkthrough
  const [walkStep, setWalkStep] = useState(()=>{try{return localStorage.getItem("bam_pb_walkthrough_done")==="1"?-1:0;}catch{return 0;}});
  const [showHelp, setShowHelp] = useState(false);
  const WALK_STEPS=[
    {title:"Place Players",desc:"Click 'Player' to add offensive and defensive players to the court. Drag them into position for Stage 1.",highlight:"add-player"},
    {title:"Next Stage",desc:"Press Enter or click 'Next Stage' to advance. Players stay in place — drag them to their new positions. Add screens for picks and off-ball actions.",highlight:"canvas"},
    {title:"Play It Back",desc:"Press the Play button to watch your full play animate — players glide smoothly between each stage.",highlight:"canvas"},
  ];
  const dismissWalkthrough=()=>{setWalkStep(-1);try{localStorage.setItem("bam_pb_walkthrough_done","1");}catch{};};
  const reopenWalkthrough=()=>{setWalkStep(0);setShowHelp(false);};

  const [bookError, setBookError] = useState("");

  const createBook = () => {
    const name=newBookName.trim();
    if (!name) { setBookError("Please enter a playbook name"); return; }
    if (myBooks.length>=10) { setBookError("Maximum 10 playbooks reached"); return; }
    if (myBooks.some(b=>b.title.toLowerCase()===name.toLowerCase())) { setBookError("A playbook with this name already exists"); return; }
    setBookError("");
    const nb={id:Date.now(),title:name,type:"Set Play",level:"All Levels",notes:"",
      plays:[{id:1,name:"Play 1",players:[],ball:null,stages:[{drawings:[]}]}],updatedAt:"just now"};
    setMyBooks(p=>[...p,nb]); setActiveBook(nb); setActivePlayIdx(0); setStageIdx(0);
    setNewBookName(""); setShowNewBook(false); setView("editor");
  };

  const openBook=(book)=>{ setActiveBook(book); setActivePlayIdx(0); setStageIdx(0); setView("editor"); };

  const updateBook=(updated)=>{ setActiveBook(updated); setMyBooks(prev=>prev.map(b=>b.id===updated.id?updated:b)); };

  const updatePlay=(playId,newPlay)=>{
    if(!activeBook) return;
    updateBook({...activeBook,plays:activeBook.plays.map(p=>p.id===playId?newPlay:p),updatedAt:"just now"});
  };

  const addPlay=()=>{
    if(!activeBook) return;
    if(activeBook.plays.length>=15) return; // 15 plays per playbook cap
    const np={id:Date.now(),name:`Play ${activeBook.plays.length+1}`,players:[],ball:null,stages:[{drawings:[]}]};
    const updated={...activeBook,plays:[...activeBook.plays,np],updatedAt:"just now"};
    updateBook(updated); setActivePlayIdx(updated.plays.length-1); setStageIdx(0);
  };

  const addStage=()=>{
    if(!activeBook||!currentPlay) return;
    if((currentPlay.stages?.length||1)>=20) return; // 20-stage cap
    if((currentPlay.players||[]).length===0) return; // must have players first
    // Clone player/ball positions from current stage into new stage
    const newStages=[...currentPlay.stages,{drawings:[]}];
    const newStageIdx=newStages.length-1;
    const players=(currentPlay.players||[]).map(pl=>{
      const curPos=pl.positions?.[stageIdx]||pl.positions?.[0]||{x:100,y:200};
      return {...pl,positions:{...pl.positions,[newStageIdx]:{...curPos}}};
    });
    let ball=currentPlay.ball;
    if(ball){
      const curPos=ball.positions?.[stageIdx]||ball.positions?.[0]||{x:200,y:200};
      ball={...ball,positions:{...ball.positions,[newStageIdx]:{...curPos}}};
    }
    updatePlay(currentPlay.id,{...currentPlay,players,ball,stages:newStages});
    setStageIdx(newStageIdx);
  };

  const deleteStage=()=>{
    if(!activeBook||!currentPlay||currentPlay.stages.length<=1) return;
    const delIdx=stageIdx;
    const newStages=currentPlay.stages.filter((_,i)=>i!==delIdx);
    // Re-index player positions: shift all indices above delIdx down by 1
    const players=(currentPlay.players||[]).map(pl=>{
      const newPos={};
      Object.keys(pl.positions||{}).forEach(k=>{
        const ki=parseInt(k);
        if(ki<delIdx) newPos[ki]=pl.positions[k];
        else if(ki>delIdx) newPos[ki-1]=pl.positions[k];
        // ki===delIdx is dropped
      });
      return {...pl,positions:newPos};
    });
    let ball=currentPlay.ball;
    if(ball){
      const newPos={};
      Object.keys(ball.positions||{}).forEach(k=>{
        const ki=parseInt(k);
        if(ki<delIdx) newPos[ki]=ball.positions[k];
        else if(ki>delIdx) newPos[ki-1]=ball.positions[k];
      });
      ball={...ball,positions:newPos};
    }
    const newIdx=Math.max(0,delIdx-1);
    updatePlay(currentPlay.id,{...currentPlay,players,ball,stages:newStages});
    setStageIdx(newIdx);
  };

  const stopAnimRef = useRef(false);

  const stopAnimation=()=>{
    stopAnimRef.current=true;
    if(animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setAnimProgress(null); setPrevStageObjs(null); setIsAnimating(false);
  };

  // Animate between stages with easing
  const animatePlay=()=>{
    if(isAnimating||!currentPlay) return;
    const totalStages=currentPlay.stages.length;
    if(totalStages<2) return;
    stopAnimRef.current=false;
    setIsAnimating(true);
    let s=0;
    setStageIdx(0);

    const runStage=(fromIdx,toIdx)=>{
      if(stopAnimRef.current) return;
      const ppos={};
      (currentPlay.players||[]).forEach(pl=>{
        ppos[pl.id]=pl.positions?.[fromIdx]||pl.positions?.[0]||{x:100,y:200};
      });
      setPrevStageObjs({
        playerPositions:ppos,
        ballPos:currentPlay.ball?.positions?.[fromIdx]||currentPlay.ball?.positions?.[0]||null
      });
      setStageIdx(toIdx);

      const baseDuration=2500;
      const duration=baseDuration/playSpeed;
      const start=performance.now();
      const frame=(now)=>{
        if(stopAnimRef.current) return;
        const raw=Math.min((now-start)/duration,1);
        const eased=easeInOut(raw);
        setAnimProgress(eased);
        if(raw<1) {
          animFrameRef.current=requestAnimationFrame(frame);
        } else {
          setAnimProgress(null);
          setPrevStageObjs(null);
          s=toIdx;
          if(s<totalStages-1) {
            setTimeout(()=>runStage(s,s+1),400/playSpeed);
          } else if(loopPlay) {
            setTimeout(()=>{s=0;setStageIdx(0);runStage(0,1);},600/playSpeed);
          } else {
            setIsAnimating(false);
          }
        }
      };
      animFrameRef.current=requestAnimationFrame(frame);
    };
    runStage(0,1);
  };

  useEffect(()=>{return()=>{ if(animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };},[]);

  const exportPlaybook=()=>{
    if(!activeBook) return;
    const plays=activeBook.plays;
    const cols=Math.min(plays.length,2), rows=Math.ceil(plays.length/cols);
    const margin=28, headerH=90, footerH=60;
    const W=cols*(COURT_W+margin)+margin, H=headerH+rows*(COURT_H+50+margin)+footerH;
    const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
    const ctx=cv.getContext("2d");
    ctx.fillStyle=dark?"#111":"#8B5A1A"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle=dark?"#1A1208":"#6B3E10"; ctx.fillRect(0,0,W,headerH);
    ctx.strokeStyle=GOLD; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,headerH); ctx.lineTo(W,headerH); ctx.stroke();
    ctx.fillStyle=GOLD; ctx.font="900 22px sans-serif"; ctx.textAlign="left"; ctx.textBaseline="middle";
    ctx.fillText("BAM COACHES",margin,headerH/2-8);
    ctx.fillStyle=dark?"#aaa":"#ddd"; ctx.font="600 13px sans-serif";
    ctx.fillText(activeBook.title,margin,headerH/2+12);
    // QR
    const qS=58,qX=W-margin-qS,qY=(headerH-qS)/2;
    ctx.fillStyle="#fff"; ctx.fillRect(qX,qY,qS,qS);
    ctx.fillStyle="#111"; ctx.font="bold 6.5px monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("bamcoaches.io",qX+qS/2,qY+qS-7);
    [[0,0],[0,1],[0,2],[1,0],[2,0],[2,1],[2,2],[0,4],[0,5],[0,6],[2,4],[2,5],[2,6],[4,0],[4,1],[4,2],[5,0],[6,0],[6,1],[6,2],[4,4],[5,5],[4,6],[6,4],[6,6]].forEach(([r,c])=>{
      ctx.fillRect(qX+4+c*7,qY+4+r*7,6,6);
    });
    plays.forEach((play,i)=>{
      const col=i%cols,row=Math.floor(i/cols);
      const cx=margin+col*(COURT_W+margin),cy=headerH+margin/2+row*(COURT_H+50+margin);
      const tc=document.createElement("canvas"); tc.width=COURT_W; tc.height=COURT_H;
      const tCtx=tc.getContext("2d");
      drawCourt(tCtx,COURT_W,COURT_H,dark);
      // Draw last stage
      const lastStage=(play.stages||[{}])[play.stages.length-1]||{};
      (lastStage.drawings||[]).forEach(obj=>{
        if(obj.type==="arrow") drawArrowPath(tCtx,obj.points,obj.color,false);
        else if(obj.type==="dribble") drawArrowPath(tCtx,obj.points,obj.color,true);
        else if(obj.type==="screen") drawScreen(tCtx,obj.x,obj.y,obj.color,obj.rot);
      });
      const lastStageIdx=(play.stages?.length||1)-1;
      (play.players||[]).forEach(pl=>{
        const pos=pl.positions?.[lastStageIdx]||pl.positions?.[0]||{x:100,y:200};
        drawPlayer(tCtx,{...pl,...pos},false,dark);
      });
      if(play.ball){
        const bp=play.ball.positions?.[lastStageIdx]||play.ball.positions?.[0]||{x:200,y:200};
        drawBall(tCtx,bp.x,bp.y,false);
      }
      ctx.drawImage(tc,cx,cy);
      ctx.fillStyle=GOLD; ctx.font="700 13px sans-serif"; ctx.textAlign="left"; ctx.textBaseline="top";
      ctx.fillText(play.name,cx,cy+COURT_H+8);
      ctx.fillStyle=dark?"#888":"#ccc"; ctx.font="500 11px sans-serif";
      ctx.fillText(`${play.stages?.length||1} stage${(play.stages?.length||1)!==1?"s":""}`,cx,cy+COURT_H+26);
    });
    ctx.fillStyle="rgba(0,0,0,0.2)"; ctx.fillRect(0,H-footerH,W,footerH);
    ctx.fillStyle=GOLD; ctx.font="700 11px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("BY ANY MEANS COACHES  ·  PLAYBOOK BUILDER  ·  bamcoaches.io",W/2,H-footerH/2);
    const a=document.createElement("a");
    a.download=`${activeBook.title.replace(/\s+/g,"-")}.png`; a.href=cv.toDataURL("image/png"); a.click();
  };

  const currentPlay=activeBook?.plays[activePlayIdx];
  const totalStages=currentPlay?.stages?.length||1;

  return (
    <div style={{flex:1,overflow:"auto",padding:"0 28px 40px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingTop:16,flexWrap:"wrap"}}>
        {view==="editor"&&(
          <button onClick={()=>setView("mine")} style={{background:"none",border:"none",cursor:"pointer",
            color:C.textDim,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:3,padding:0,flexShrink:0}}>
            ← Back
          </button>
        )}
        <div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:-.3,lineHeight:1.2}}>
            {view==="editor"?activeBook?.title:"Playbook Builder"}
          </div>
          <div style={{fontSize:13,color:C.textDim,marginTop:2}}>
            {view==="mine"?"Your saved playbooks":view==="public"?"Community playbooks":`${activeBook?.plays.length} play${activeBook?.plays.length!==1?"s":""}`}
          </div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          {view==="editor"&&(
            <>
              <button onClick={()=>setShowNotes(v=>!v)}
                style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${showNotes?GOLD:C.border}`,
                  background:showNotes?`${GOLD}22`:"transparent",color:showNotes?GOLD:C.textMid,
                  cursor:"pointer",fontWeight:700,fontSize:13}}>
                📝 Notes
              </button>
              <button onClick={()=>setShowIg(v=>!v)}
                style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${showIg?GOLD:C.border}`,
                  background:showIg?`${GOLD}22`:"transparent",color:showIg?GOLD:C.textMid,
                  cursor:"pointer",fontWeight:700,fontSize:13}}>
                📷 IG
              </button>
              <button onClick={()=>setShowX(v=>!v)}
                style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${showX?GOLD:C.border}`,
                  background:showX?`${GOLD}22`:"transparent",color:showX?GOLD:C.textMid,
                  cursor:"pointer",fontWeight:700,fontSize:13}}>
                𝕏 Handle
              </button>
              <button onClick={exportPlaybook}
                style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,
                  background:GOLD,color:"#111",border:"none",cursor:"pointer",fontWeight:800,fontSize:13}}>
                ↓ Export + QR
              </button>
            </>
          )}
          {view!=="editor"&&(
            <>
              <button onClick={()=>setView("mine")}
                style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${view==="mine"?GOLD:C.border}`,
                  background:view==="mine"?`${GOLD}22`:"transparent",color:view==="mine"?GOLD:C.textMid,
                  cursor:"pointer",fontWeight:700,fontSize:13}}>My Playbooks</button>
              <button onClick={()=>setView("public")}
                style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${view==="public"?GOLD:C.border}`,
                  background:view==="public"?`${GOLD}22`:"transparent",color:view==="public"?GOLD:C.textMid,
                  cursor:"pointer",fontWeight:700,fontSize:13}}>🌐 Public</button>
            </>
          )}
        </div>
      </div>

      {/* MY PLAYBOOKS */}
      {view==="mine"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
          {!showNewBook?(
            myBooks.length<10?(
              <div onClick={()=>setShowNewBook(true)}
                style={{border:`2px dashed ${C.border}`,borderRadius:14,padding:28,cursor:"pointer",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  gap:8,minHeight:150,color:C.textDim}}>
                <div style={{fontSize:28}}>+</div>
                <div style={{fontWeight:700,fontSize:13}}>New Playbook</div>
              </div>
            ):(
              <div style={{border:`2px dashed ${C.border}`,borderRadius:14,padding:28,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                gap:8,minHeight:150,color:C.textDim,opacity:0.5}}>
                <div style={{fontSize:14,fontWeight:700}}>Playbook limit reached (10)</div>
              </div>
            )
          ):(
            <div style={{border:`1px solid ${GOLD}`,borderRadius:14,padding:18,
              background:dark?"#1E1E1E":"#fff",display:"flex",flexDirection:"column",gap:9}}>
              <div style={{fontSize:13,fontWeight:800,color:C.text}}>New Playbook</div>
              <input value={newBookName} onChange={e=>setNewBookName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&createBook()} placeholder="Playbook name..." autoFocus
                style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,
                  background:dark?"#111":"#f5f5f5",color:C.text,fontSize:13,outline:"none"}}/>
              {bookError&&<div style={{fontSize:12,color:"#e07070",fontWeight:600}}>{bookError}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={createBook}
                  style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:GOLD,color:"#111",fontWeight:800,cursor:"pointer",fontSize:13}}>Create</button>
                <button onClick={()=>{setShowNewBook(false);setNewBookName("");setBookError("");}}
                  style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.textDim,cursor:"pointer",fontSize:13}}>Cancel</button>
              </div>
            </div>
          )}
          {myBooks.map(book=>(
            <div key={book.id} onClick={()=>openBook(book)}
              style={{border:`1px solid ${C.border}`,borderRadius:14,padding:18,cursor:"pointer",background:C.bgCard}}>
              <div style={{width:"100%",paddingBottom:"56%",position:"relative",borderRadius:8,overflow:"hidden",
                marginBottom:12,background:dark?"#1A1208":"#C8832A"}}>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:16,fontWeight:900,color:dark?"rgba(226,221,159,0.18)":"rgba(255,255,255,0.2)",letterSpacing:2}}>BAM</div>
                </div>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:3}}>{book.title}</div>
              <div style={{display:"flex",gap:6,marginBottom:6}}>
                <span style={{fontSize:11,padding:"2px 7px",borderRadius:20,background:dark?"rgba(226,221,159,0.1)":"rgba(180,160,0,0.12)",color:GOLD,fontWeight:600}}>{book.type}</span>
                <span style={{fontSize:11,padding:"2px 7px",borderRadius:20,background:dark?"rgba(255,255,255,0.06)":"#f0f0f0",color:C.textDim,fontWeight:600}}>{book.level}</span>
              </div>
              <div style={{fontSize:12,color:C.textDim}}>{book.plays.length} play{book.plays.length!==1?"s":""} · {book.updatedAt}</div>
            </div>
          ))}
        </div>
      )}

      {/* PUBLIC */}
      {view==="public"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
          {PUBLIC_PLAYBOOKS.map(pb=>(
            <div key={pb.id} style={{border:`1px solid ${C.border}`,borderRadius:14,padding:18,background:C.bgCard}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:GOLD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#111",flexShrink:0}}>{pb.avatar}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{pb.author}</div>
                  <div style={{fontSize:11,color:C.textDim}}>{pb.team}</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:12,color:C.textDim}}>♥ {pb.likes}</div>
              </div>
              <div style={{width:"100%",paddingBottom:"52%",position:"relative",borderRadius:8,overflow:"hidden",
                marginBottom:10,background:dark?"#1A1208":"#C8832A"}}>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:14,fontWeight:900,color:"rgba(255,255,255,0.15)",letterSpacing:2}}>BAM</div>
                </div>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:3}}>{pb.title}</div>
              <div style={{fontSize:12,color:C.textDim,marginBottom:9}}>{pb.desc}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:11}}>
                {pb.tags.map(t=>(
                  <span key={t} style={{fontSize:11,padding:"2px 8px",borderRadius:20,
                    background:dark?"rgba(226,221,159,0.1)":"rgba(180,160,0,0.12)",color:GOLD,fontWeight:600}}>{t}</span>
                ))}
              </div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <span style={{fontSize:12,color:C.textDim}}>{pb.plays} plays</span>
                <button style={{marginLeft:"auto",padding:"5px 12px",borderRadius:8,border:`1px solid ${GOLD}`,background:"transparent",color:GOLD,fontSize:12,fontWeight:700,cursor:"pointer"}}>View</button>
                <button style={{padding:"5px 12px",borderRadius:8,border:"none",background:GOLD,color:"#111",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDITOR */}
      {view==="editor"&&activeBook&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Playbook meta: type, level */}
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",
            padding:"12px 16px",borderRadius:12,border:`1px solid ${C.border}`,background:C.bgCard}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:C.textDim,fontWeight:700}}>Type:</span>
              {PLAY_TYPES.map(t=>(
                <button key={t} onClick={()=>updateBook({...activeBook,type:t})}
                  style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${activeBook.type===t?GOLD:C.border}`,
                    background:activeBook.type===t?`${GOLD}22`:"transparent",
                    color:activeBook.type===t?GOLD:C.textMid,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{width:1,height:20,background:C.border}}/>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:C.textDim,fontWeight:700}}>Level:</span>
              {PLAY_LEVELS.map(l=>(
                <button key={l} onClick={()=>updateBook({...activeBook,level:l})}
                  style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${activeBook.level===l?GOLD:C.border}`,
                    background:activeBook.level===l?`${GOLD}22`:"transparent",
                    color:activeBook.level===l?GOLD:C.textMid,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Notes panel */}
          {showNotes&&(
            <div style={{padding:"14px 16px",borderRadius:12,border:`1px solid ${GOLD}55`,background:dark?"#1A1A1A":"#fffef5"}}>
              <div style={{fontSize:12,fontWeight:800,color:GOLD,marginBottom:8,letterSpacing:.5,textTransform:"uppercase"}}>Coach's Notes</div>
              <textarea value={activeBook.notes||""} onChange={e=>updateBook({...activeBook,notes:e.target.value})}
                placeholder="Describe the play, keys to execution, when to use it..."
                style={{width:"100%",minHeight:80,padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,
                  background:dark?"#111":"#fff",color:C.text,fontSize:13,lineHeight:1.6,
                  outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
            </div>
          )}

          {/* Social handles */}
          {(showIg||showX)&&(
            <div style={{display:"flex",gap:12,padding:"12px 16px",borderRadius:12,
              border:`1px solid ${C.border}`,background:C.bgCard,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:700,color:C.textDim}}>Court watermark:</span>
              {showIg&&(
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12,color:C.textDim}}>📷 @</span>
                  <input value={igHandle} onChange={e=>setIgHandle(e.target.value.replace('@',''))}
                    placeholder="your_handle"
                    style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${C.border}`,
                      background:dark?"#111":"#f5f5f5",color:C.text,fontSize:12,outline:"none",width:140}}/>
                </div>
              )}
              {showX&&(
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12,color:C.textDim}}>𝕏 @</span>
                  <input value={xHandle} onChange={e=>setXHandle(e.target.value.replace('@',''))}
                    placeholder="your_handle"
                    style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${C.border}`,
                      background:dark?"#111":"#f5f5f5",color:C.text,fontSize:12,outline:"none",width:140}}/>
                </div>
              )}
              <span style={{fontSize:11,color:C.textDim,marginLeft:4}}>Shown subtly in court corner</span>
            </div>
          )}

          {/* Main editor grid */}
          <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:16,alignItems:"start"}}>
            {/* Plays sidebar */}
            <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,
                display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:11,fontWeight:800,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>Plays</div>
                {activeBook.plays.length<15&&(
                  <button onClick={addPlay}
                    style={{width:20,height:20,borderRadius:"50%",background:GOLD,border:"none",cursor:"pointer",
                      fontSize:15,fontWeight:900,color:"#111",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>+</button>
                )}
              </div>
              {activeBook.plays.map((play,idx)=>(
                <div key={play.id} onClick={()=>{setActivePlayIdx(idx);setStageIdx(0);}}
                  style={{padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                    background:idx===activePlayIdx?(dark?"rgba(226,221,159,0.07)":"rgba(180,160,0,0.07)"):"transparent",
                    borderLeft:idx===activePlayIdx?`3px solid ${GOLD}`:"3px solid transparent",
                    borderBottom:`1px solid ${C.border}`}}>
                  <div style={{flex:1,fontSize:13,fontWeight:idx===activePlayIdx?700:500,
                    color:idx===activePlayIdx?GOLD:C.textMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {play.name}
                  </div>
                  {activeBook.plays.length>1&&(
                    <div onClick={e=>{e.stopPropagation();
                      const updated={...activeBook,plays:activeBook.plays.filter(p=>p.id!==play.id)};
                      updateBook(updated); setActivePlayIdx(Math.max(0,activePlayIdx-1));}}
                      style={{fontSize:10,color:C.textDim,cursor:"pointer",opacity:.5}}>✕</div>
                  )}
                </div>
              ))}
            </div>

            {/* Canvas + controls */}
            {currentPlay&&(
              <div>
                {/* Play name + stage strip */}
                <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <input value={currentPlay.name}
                    onChange={e=>updatePlay(currentPlay.id,{...currentPlay,name:e.target.value})}
                    placeholder="Name this play..."
                    style={{fontSize:17,fontWeight:800,color:C.text,background:"transparent",border:"none",
                      outline:"none",borderBottom:`2px solid ${!currentPlay.name.trim()?"#e07070":(dark?"#333":"#ddd")}`,padding:"2px 4px",
                      minWidth:150,transition:"border-color .2s"}}
                    onFocus={e=>e.target.style.borderBottomColor=!currentPlay.name.trim()?"#e07070":GOLD}
                    onBlur={e=>e.target.style.borderBottomColor=!currentPlay.name.trim()?"#e07070":(dark?"#333":"#ddd")}/>

                  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:12,color:C.textDim,fontWeight:600}}>Stages:</span>
                    <div style={{display:"flex",gap:3}}>
                      {currentPlay.stages.map((_,i)=>(
                        <button key={i} onClick={()=>setStageIdx(i)}
                          style={{width:30,height:28,borderRadius:7,border:`1px solid ${stageIdx===i?GOLD:C.border}`,
                            background:stageIdx===i?`${GOLD}22`:"transparent",
                            color:stageIdx===i?GOLD:C.textMid,fontSize:12,fontWeight:800,cursor:"pointer"}}>
                          {i+1}
                        </button>
                      ))}
                      {totalStages<20&&(currentPlay.players||[]).length>0&&(
                        <button onClick={addStage}
                          style={{width:28,height:28,borderRadius:7,border:`1px dashed ${C.border}`,
                            background:"transparent",color:C.textDim,fontSize:16,cursor:"pointer",lineHeight:1,fontWeight:700}}>+</button>
                      )}
                      {totalStages>1&&(
                        <button onClick={deleteStage}
                          style={{width:28,height:28,borderRadius:7,border:`1px solid ${dark?"#333":"#ddd"}`,
                            background:"transparent",color:"#e07070",fontSize:12,cursor:"pointer",fontWeight:700}}>−</button>
                      )}
                    </div>
                    {isAnimating?(
                      <button onClick={stopAnimation}
                        style={{padding:"5px 14px",borderRadius:8,border:"none",cursor:"pointer",
                          fontWeight:800,fontSize:12,background:"#e07070",color:"#fff"}}>
                        ■ Stop
                      </button>
                    ):(
                      <button onClick={animatePlay} disabled={totalStages<2}
                        style={{padding:"5px 14px",borderRadius:8,border:"none",cursor:totalStages<2?"not-allowed":"pointer",
                          fontWeight:800,fontSize:12,transition:"opacity .2s",
                          background:totalStages<2?"#333":GOLD,
                          color:"#111",opacity:totalStages<2?0.5:1}}>
                        ▶ Play
                      </button>
                    )}
                    <div style={{display:"flex",gap:2,marginLeft:4}}>
                      {[0.5,1,2].map(sp=>(
                        <button key={sp} onClick={()=>setPlaySpeed(sp)}
                          style={{padding:"3px 7px",borderRadius:5,border:`1px solid ${playSpeed===sp?GOLD:C.border}`,
                            background:playSpeed===sp?`${GOLD}22`:"transparent",
                            color:playSpeed===sp?GOLD:C.textDim,fontSize:10,fontWeight:700,cursor:"pointer"}}>
                          {sp}x
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>setLoopPlay(l=>!l)}
                      style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${loopPlay?GOLD:C.border}`,
                        background:loopPlay?`${GOLD}22`:"transparent",
                        color:loopPlay?GOLD:C.textDim,fontSize:10,fontWeight:700,cursor:"pointer"}}>
                      {loopPlay?"🔁 Loop":"→ Once"}
                    </button>
                  </div>
                </div>

                <PlayCanvas
                  play={currentPlay}
                  stageIdx={stageIdx}
                  onUpdate={p=>updatePlay(currentPlay.id,p)}
                  C={C} dark={dark}
                  animProgress={animProgress}
                  prevStageObjs={prevStageObjs}
                  igHandle={igHandle} xHandle={xHandle}
                  readOnly={isAnimating}
                  onNextStage={()=>{
                    const total=currentPlay?.stages?.length||1;
                    if(stageIdx<total-1) setStageIdx(stageIdx+1);
                    else if((currentPlay.players||[]).length>0&&total<20) addStage();
                  }}
                />

                <div style={{marginTop:12,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:13,color:C.textDim,lineHeight:1.5}}>
                    <b style={{color:C.textMid,fontSize:14}}>Stage {stageIdx+1}:</b> Drag players and ball to position them. Press Enter or click "Next Stage" to add a new stage.
                  </span>
                  {totalStages>=2&&(
                    <span style={{fontSize:11,color:GOLD,marginLeft:"auto"}}>
                      ▶ Play animates player movement between stages
                    </span>
                  )}
                </div>
                {/* Stage indicator bar */}
                {totalStages>=2&&(
                  <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    {currentPlay.stages.map((_,i)=>(
                      <div key={i} onClick={()=>!isAnimating&&setStageIdx(i)}
                        style={{display:"flex",alignItems:"center",gap:4,cursor:isAnimating?"default":"pointer"}}>
                        <div style={{
                          width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:13,fontWeight:800,transition:"all .25s",
                          background:stageIdx===i?GOLD:"transparent",
                          color:stageIdx===i?"#111":C.textDim,
                          border:`2px solid ${stageIdx===i?GOLD:C.border}`,
                        }}>{i+1}</div>
                        {i<totalStages-1&&(
                          <div style={{width:24,height:2,background:i<stageIdx?GOLD:C.border,borderRadius:1,transition:"background .25s"}}/>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Prompt 9: Walkthrough popup */}
      {view==="editor"&&walkStep>=0&&walkStep<WALK_STEPS.length&&(
        <div style={{position:"fixed",inset:0,zIndex:4500,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
          <div style={{background:dark?"#1A1A1A":"#fff",borderRadius:16,padding:"28px 32px",maxWidth:400,textAlign:"center",border:`1px solid ${GOLD}40`,boxShadow:`0 20px 60px rgba(0,0,0,0.5)`}}>
            <div style={{fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Step {walkStep+1} of {WALK_STEPS.length}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:GOLD,letterSpacing:1.5,marginBottom:8}}>{WALK_STEPS[walkStep].title}</div>
            <div style={{fontSize:14,color:C.textMid,lineHeight:1.7,marginBottom:24}}>{WALK_STEPS[walkStep].desc}</div>
            <div style={{display:"flex",gap:6,justifyContent:"center"}}>
              {/* Progress dots */}
              {WALK_STEPS.map((_,i)=>(
                <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i===walkStep?GOLD:(dark?"#333":"#ddd"),transition:"background .2s"}}/>
              ))}
            </div>
            <div style={{marginTop:20}}>
              {walkStep<WALK_STEPS.length-1?(
                <button onClick={()=>setWalkStep(w=>w+1)}
                  style={{padding:"10px 32px",borderRadius:9,fontSize:14,fontWeight:800,background:GOLD,color:"#111",border:"none",cursor:"pointer",letterSpacing:.5,fontFamily:"'Bebas Neue',sans-serif"}}>
                  NEXT
                </button>
              ):(
                <button onClick={dismissWalkthrough}
                  style={{padding:"10px 32px",borderRadius:9,fontSize:14,fontWeight:800,background:GOLD,color:"#111",border:"none",cursor:"pointer",letterSpacing:.5,fontFamily:"'Bebas Neue',sans-serif"}}>
                  GOT IT, LET'S BUILD
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Prompt 9: Help button — always visible in editor */}
      {view==="editor"&&walkStep===-1&&(
        <div onClick={reopenWalkthrough}
          style={{position:"fixed",bottom:24,right:24,width:36,height:36,borderRadius:"50%",background:GOLD,color:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,boxShadow:`0 4px 14px ${GOLD}44`,zIndex:100,cursor:"pointer"}}>
          ?
        </div>
      )}
    </div>
  );
}






// ── MEMBER MAP OVERLAY ────────────────────────────────────────────────────
const MEMBER_PINS = [
  { name:"Coleman Ayers", city:"Miami, FL", initials:"CA", lat:25.77, lon:-80.19, x:275.3, y:162.9, delay:0 },
  { name:"Marcus T.", city:"Toronto, CA", initials:"MT", lat:43.65, lon:-79.38, x:288.0, y:116.7, delay:120 },
  { name:"James O.", city:"Lagos, NG", initials:"JO", lat:6.52, lon:3.38, x:457.6, y:213.0, delay:240 },
  { name:"Sofia R.", city:"Barcelona, ES", initials:"SR", lat:41.38, lon:2.17, x:454.5, y:122.5, delay:180 },
  { name:"Kwame D.", city:"Accra, GH", initials:"KD", lat:5.56, lon:-0.2, x:449.6, y:215.5, delay:300 },
  { name:"Yuki T.", city:"Osaka, JP", initials:"YT", lat:34.69, lon:135.5, x:737.2, y:139.7, delay:360 },
];

const WORLD_PATHS = [
  "M201.7,104.9L261.6,103.2L298.0,113.2L315.6,108.2L306.7,118.3L288.5,141.5L275.4,164.6L271.7,164.6L262.7,151.8L255.6,154.4L247.3,153.1L238.8,162.3L227.6,154.4L212.0,148.5L200.1,145.4L195.0,141.5L193.6,133.7L192.4,124.7L201.7,104.9Z",
  "M192.4,76.6L329.6,108.2L315.6,108.2L298.0,113.2L261.6,103.2L192.4,76.6L201.6,76.6L200.0,90.8L202.6,105.7L203.5,100.7L200.0,90.8L192.4,76.6Z",
  "M192.4,76.6L203.5,100.7L261.6,103.2L298.0,113.2L315.6,108.2L329.6,108.2L317.6,115.8L343.7,108.2L342.2,98.2L331.7,108.2L319.6,115.8L316.2,113.2L322.3,105.7L327.0,110.7L329.6,108.2L332.4,98.2L330.4,81.2L324.9,76.6L320.8,69.9L310.0,69.9L304.0,74.3L293.7,83.6L287.7,88.4L281.8,81.2L275.2,76.6L266.0,76.6L247.6,76.6L229.2,76.6L210.8,76.6L194.0,78.9L192.4,76.6Z",
  "M200.1,145.4L212.0,148.5L227.6,154.4L238.8,162.3L248.4,183.1L258.9,188.3L262.0,204.0L263.9,209.2L277.3,209.2L277.5,206.6L262.1,201.4L256.1,193.5L245.5,188.3L239.9,180.5L236.8,172.7L235.0,159.7L226.1,151.8L210.9,170.1L209.3,167.5L200.1,145.4Z",
  "M336.3,47.4L330.2,65.6L375.3,67.7L421.5,55.9L422.1,45.4L380.2,45.4L336.3,47.4Z",
  "M406.9,69.9L424.9,69.9L427.3,63.5L411.6,63.5L407.7,65.6L406.9,69.9Z",
  "M440.1,100.7L446.1,98.2L451.0,98.2L453.9,98.2L450.0,90.8L446.3,81.2L440.7,81.2L438.7,83.6L440.5,88.4L444.2,95.7L440.1,100.7Z",
  "M430.5,95.7L438.2,98.2L438.5,88.4L430.8,90.8L430.5,95.7Z",
  "M439.8,115.8L466.3,115.8L464.1,110.7L460.0,105.7L453.9,98.2L446.0,103.2L440.0,105.7L439.8,115.8Z",
  "M431.2,131.1L456.1,115.8L456.2,120.9L450.0,115.8L445.9,115.8L431.7,115.8L431.2,131.1Z",
  "M464.3,115.8L479.3,131.1L483.5,131.1L483.1,123.4L478.5,115.8L474.4,115.8L466.1,110.7L464.3,115.8Z",
  "M459.3,81.2L468.7,81.2L483.1,76.6L496.9,55.9L500.3,55.9L495.8,65.6L490.5,76.6L494.9,81.2L483.9,83.6L476.4,83.6L468.7,81.2L459.3,81.2Z",
  "M496.9,55.9L504.2,57.7L502.9,65.6L496.0,76.6L501.5,76.6L506.4,65.6L500.3,55.9Z",
  "M461.8,98.2L479.4,98.2L487.7,103.2L484.1,108.2L476.1,108.2L466.0,105.7L461.8,98.2Z",
  "M476.1,108.2L486.1,108.2L498.1,108.2L503.5,120.9L495.7,126.0L491.9,131.1L483.5,131.1L476.5,115.8L476.1,108.2Z",
  "M493.4,100.7L513.1,100.7L526.2,108.2L519.3,115.8L508.8,113.2L493.9,105.7L493.4,100.7Z",
  "M504.2,57.7L518.5,59.6L552.7,59.6L564.6,88.4L547.4,95.7L528.9,100.7L505.2,100.7L492.0,88.4L505.2,76.6L504.2,57.7Z",
  "M552.7,59.6L579.5,51.1L611.8,51.1L676.6,51.1L723.8,59.6L752.4,67.7L758.0,59.6L759.2,76.6L755.6,88.4L750.9,108.2L736.6,118.3L719.3,105.7L716.1,118.3L696.5,100.7L683.8,95.7L661.5,90.8L647.2,100.7L627.5,100.7L602.8,88.4L582.8,86.0L564.6,88.4L552.7,59.6Z",
  "M547.4,95.7L564.6,88.4L602.8,88.4L617.6,100.7L602.0,113.2L563.1,120.9L551.9,115.8L547.4,95.7Z",
  "M503.5,120.9L540.5,120.9L542.1,131.1L525.9,136.3L508.8,133.7L504.4,131.1L503.5,120.9Z",
  "M525.9,136.3L557.7,151.8L572.5,167.5L548.3,198.8L530.4,198.8L518.9,151.8L522.3,141.5L525.9,136.3Z",
  "M540.5,120.9L581.6,120.9L596.5,131.1L594.4,167.5L572.5,167.5L557.7,151.8L542.1,131.1L540.5,120.9Z",
  "M598.8,167.5L623.3,157.0L640.6,157.0L642.6,167.5L629.4,209.2L620.4,209.2L608.9,177.9L598.8,167.5Z",
  "M652.2,172.7L691.8,172.7L715.8,183.1L697.2,219.6L674.9,224.8L663.4,217.0L640.6,157.0L642.6,167.5L652.2,172.7Z",
  "M616.0,126.0L647.2,100.7L683.8,95.7L716.1,118.3L709.4,126.0L708.4,151.8L693.7,183.1L669.8,172.7L644.9,157.0L622.3,151.8L616.0,126.0Z",
  "M713.5,141.5L726.3,141.5L730.5,141.5L732.7,136.3L724.0,126.0L717.4,120.9L713.3,120.9L709.5,131.1L713.5,141.5Z",
  "M729.0,149.2L730.3,146.7L730.5,141.5L738.0,138.9L741.3,123.4L744.1,120.9L742.6,126.0L739.0,141.5L728.4,141.5L728.1,146.7L729.0,149.2Z",
  "M738.0,120.9L741.3,115.8L745.4,115.8L748.2,120.9L741.3,123.4L738.0,120.9Z",
  "M409.9,193.5L539.4,198.8L566.2,198.8L566.4,204.0L548.7,209.2L540.0,230.0L528.6,245.6L521.6,256.0L507.6,276.9L488.3,318.5L484.0,318.5L476.6,276.9L472.5,245.6L468.0,219.6L454.5,219.6L432.0,219.6L409.9,193.5Z",
  "M539.4,198.8L566.2,198.8L566.4,204.0L548.7,209.2L544.0,204.0L539.4,198.8Z",
  "M548.3,261.2L561.4,266.5L559.4,292.5L545.8,297.7L548.3,261.2Z",
  "M700.6,287.3L719.3,282.1L740.4,261.2L756.7,271.7L777.8,276.9L782.6,292.5L768.1,328.9L757.2,334.0L751.4,328.9L738.8,328.9L730.5,318.5L705.0,318.5L698.2,313.3L700.6,287.3Z",
  "M812.8,323.7L822.5,328.9L812.0,339.1L807.0,334.0L812.8,323.7Z",
  "M266.1,209.2L316.0,198.8L337.6,219.6L373.6,240.4L369.4,256.0L361.1,271.7L357.7,287.3L353.7,292.5L338.7,313.3L321.0,374.0L301.9,364.3L301.9,339.1L295.0,308.2L300.5,287.3L285.1,266.5L270.1,235.2L270.1,224.8L275.1,209.2L266.1,209.2Z",
  "M265.4,172.7L286.7,177.9L287.3,172.7L265.4,172.7Z",
  "M742.2,240.4L764.8,235.2L786.4,250.8L781.3,256.0L763.9,250.8L741.9,245.6L742.2,240.4Z",
  "M692.9,224.8L715.0,214.4L715.4,230.0L692.7,240.4L692.9,224.8Z",
  "M665.9,224.8L688.4,230.0L692.5,245.6L674.7,240.4L665.9,224.8Z",
  "M688.0,245.6L701.2,250.8L705.6,250.8L701.2,250.8L688.0,245.6Z",
  "M714.6,209.2L732.5,209.2L729.1,183.1L715.8,183.1L714.6,209.2Z",
  "M629.6,214.4L634.1,214.4L633.9,209.2L629.4,209.2L629.6,214.4Z",
  "M713.8,172.7L718.2,172.7L716.3,164.9L712.0,164.9L713.8,172.7Z"
];

function MemberMapOverlay({C, dark, onClose, onProfileClick}) {
  const [hovered, setHovered]   = useState(null);
  const [popup,   setPopup]     = useState(null); // { name, x, y }
  const W = 900, H = 460;

  const landFill   = dark ? "#1E2A1A" : "#2d3d28";
  const landStroke = dark ? "#2A3820" : "#3a5030";
  const oceanFill  = dark ? "#131824" : "#0d1f33";
  const gridFaint  = "rgba(226,221,159,0.04)";
  const equator    = "rgba(226,221,159,0.10)";

  const POPUP_DATA = {
    "Coleman Ayers": {initials:"CA",posts:84,role:"Founder",org:"BAM Basketball",bio:"Building the global game by any means necessary.",ig:"coachbam",flag:"🇺🇸"},
    "Marcus T.":     {initials:"MT",posts:47,role:"Skills Coach",org:"Private",bio:"U16-U19 skills coach. Obsessed with constraint-led design.",ig:"marcust_hoops",flag:"🇨🇦"},
    "James O.":      {initials:"JO",posts:38,role:"Head Coach",org:"Lagos Elite Academy",bio:"Building the next wave.",ig:"jamesodribbles",flag:null,flagStr:"🇳🇬"},
    "Sofia R.":      {initials:"SR",posts:31,role:"PD Coach",org:"FCB Methodology",bio:"Player development & sports scientist.",ig:null,flag:"🇪🇸"},
    "Kwame D.":      {initials:"KD",posts:22,role:"Founder",org:"Ghana Hoops Academy",bio:"Growing the game in West Africa.",ig:"kwame_develops",flag:"🇬🇭"},
    "Yuki T.":       {initials:"YT",posts:29,role:"Guard Trainer",org:"Private",bio:"10 years developing guards in Japan.",ig:"yukitrains",flag:"🇯🇵"},
  };

  return (
    <div onClick={()=>{ setPopup(null); onClose(); }}
      style={{position:"fixed",inset:0,zIndex:4000,background:"rgba(0,0,0,0.82)",
        backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",
        padding:24}}>
      <div onClick={e=>e.stopPropagation()}
        style={{width:"100%",maxWidth:960,borderRadius:20,overflow:"visible",
          border:`1px solid rgba(226,221,159,0.2)`,
          boxShadow:"0 40px 100px rgba(0,0,0,0.75)",
          animation:"mapFadeIn .38s cubic-bezier(.22,1,.36,1)",
          display:"flex",flexDirection:"column",position:"relative"}}>

        {/* Header */}
        <div style={{padding:"15px 22px",borderRadius:"20px 20px 0 0",
          background:"#111109",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          borderBottom:"1px solid rgba(226,221,159,0.12)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 0 0-8-8z"/>
            </svg>
            <span style={{fontSize:13,fontWeight:800,color:GOLD,letterSpacing:.4}}>BAM Coaches — Around the World</span>
            <span style={{fontSize:11,color:"rgba(226,221,159,0.4)",fontWeight:500}}>
              {MEMBER_PINS.length} members · {MEMBER_PINS.length} countries
            </span>
          </div>
          <div className="btn" onClick={onClose}
            style={{width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",
              justifyContent:"center",background:"rgba(255,255,255,0.06)",
              cursor:"pointer",fontSize:16,color:"rgba(226,221,159,0.5)"}}>×</div>
        </div>

        {/* Map */}
        <div style={{position:"relative",background:oceanFill,lineHeight:0,
          borderRadius:"0 0 0 0",overflow:"visible"}}
          onClick={()=>setPopup(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",display:"block",borderRadius:"0 0 0 0"}}>
            <rect width={W} height={H} fill={oceanFill}/>

            {/* Grid */}
            {[-60,-30,0,30,60].map(lat=>{
              const y=(90-lat)/180*H;
              return <line key={lat} x1="0" y1={y} x2={W} y2={y}
                stroke={lat===0?equator:gridFaint} strokeWidth={lat===0?0.7:0.3}/>;
            })}
            {[-120,-60,0,60,120].map(lon=>{
              const x=(lon+180)/360*W;
              return <line key={lon} x1={x} y1="0" x2={x} y2={H}
                stroke={lon===0?equator:gridFaint} strokeWidth={lon===0?0.7:0.3}/>;
            })}

            {/* Countries */}
            {WORLD_PATHS.map((d,i)=>(
              <path key={i} d={d} fill={landFill} stroke={landStroke} strokeWidth="0.5"/>
            ))}

            {/* Connection arcs from Coleman (hub) */}
            {MEMBER_PINS.slice(1).map((pin,i)=>{
              const hub = MEMBER_PINS[0];
              const mx = (hub.x + pin.x)/2;
              const my = Math.min(hub.y, pin.y) - 48;
              return (
                <path key={i}
                  d={`M${hub.x},${hub.y} Q${mx},${my} ${pin.x},${pin.y}`}
                  fill="none"
                  stroke="rgba(226,221,159,0.2)"
                  strokeWidth="0.9"
                  strokeDasharray="5 4"/>
              );
            })}

            {/* Pins */}
            {MEMBER_PINS.map((pin,i)=>{
              const isHov = hovered===pin.name;
              const isOpen = popup?.name===pin.name;
              return (
                <g key={pin.name} style={{cursor:"pointer"}}
                  onClick={(e)=>{
                    e.stopPropagation();
                    setPopup(isOpen ? null : {name:pin.name, x:pin.x, y:pin.y});
                  }}
                  onMouseEnter={()=>setHovered(pin.name)}
                  onMouseLeave={()=>setHovered(null)}>

                  {/* Sonar ring on hover */}
                  {isHov&&!isOpen&&<circle cx={pin.x} cy={pin.y} r="14"
                    fill="none" stroke={GOLD} strokeWidth="1"
                    style={{animation:"pinPing 1s ease-out infinite"}}/>}

                  {/* Active ring */}
                  {isOpen&&<circle cx={pin.x} cy={pin.y} r="12"
                    fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.8"/>}

                  {/* Glow */}
                  <circle cx={pin.x} cy={pin.y} r={isOpen?13:isHov?12:9}
                    fill={isOpen?GOLD+"44":isHov?GOLD+"22":"rgba(226,221,159,0.1)"}
                    style={{transition:"all .2s"}}/>

                  {/* Body */}
                  {(()=>{
                    const mem=MEMBERS[pin.name];
                    const hasPhoto=mem?.photo;
                    const r=isOpen?9:isHov?8.5:7;
                    const clipId=`pin-clip-${i}`;
                    return hasPhoto?(
                      <>
                        <defs><clipPath id={clipId}><circle cx={pin.x} cy={pin.y} r={r}/></clipPath></defs>
                        <image href={mem.photo} x={pin.x-r} y={pin.y-r} width={r*2} height={r*2}
                          clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice"
                          style={{animation:`pinDrop .5s cubic-bezier(.34,1.56,.64,1) ${pin.delay}ms both`}}/>
                        <circle cx={pin.x} cy={pin.y} r={r} fill="none" stroke={GOLD}
                          strokeWidth={isOpen||isHov?1.5:1.2} style={{transition:"all .15s"}}/>
                      </>
                    ):(
                      <>
                        <circle cx={pin.x} cy={pin.y} r={r}
                          fill={isOpen||isHov?GOLD:"#1E1A0E"}
                          stroke={GOLD} strokeWidth={isOpen||isHov?0:1.4}
                          style={{animation:`pinDrop .5s cubic-bezier(.34,1.56,.64,1) ${pin.delay}ms both`,transition:"fill .15s"}}/>
                        <text x={pin.x} y={pin.y+2.8} textAnchor="middle"
                          fontSize={isOpen||isHov?"6.5":"5.8"} fontWeight="800"
                          fontFamily="DM Sans,sans-serif"
                          fill={isOpen||isHov?"#111":GOLD}
                          style={{pointerEvents:"none"}}>
                          {pin.initials}
                        </text>
                      </>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          {/* Inline popup card — renders outside SVG as HTML overlay */}
          {popup && (()=>{
            const d = POPUP_DATA[popup.name];
            if(!d) return null;
            const svgEl = document.querySelector(".map-svg-el");
            const svgRect = svgEl?.getBoundingClientRect();
            // Position relative to the map div
            // Map viewBox is W=900,H=460; actual rendered width/height from container
            const mapDiv = document.querySelector(".map-container-div");
            const mapRect = mapDiv?.getBoundingClientRect();
            const scaleX = mapRect ? mapRect.width / W : 1;
            const scaleY = mapRect ? mapRect.height / H : 1;
            const px = popup.x * scaleX;
            const py = popup.y * scaleY;
            const cardW = 200;
            const cardH = 160;
            // Flip left if too close to right edge
            const left = px + cardW + 16 > (mapRect?.width||900) ? px - cardW - 12 : px + 12;
            const top  = Math.max(8, Math.min(py - cardH/2, (mapRect?.height||460) - cardH - 8));
            const ac = getAC(popup.name);
            return (
              <div onClick={e=>e.stopPropagation()}
                style={{
                  position:"absolute",
                  left,top,
                  width:cardW,
                  background:"#181810",
                  border:`1px solid ${GOLD}55`,
                  borderRadius:12,
                  padding:14,
                  boxShadow:"0 12px 40px rgba(0,0,0,0.7)",
                  zIndex:10,
                  animation:"dashFadeUp .18s ease forwards",
                  pointerEvents:"all",
                }}>
                {/* Arrow tip */}
                <div style={{position:"absolute",top:"50%",
                  [left === px+12 ? "left" : "right"]:-7,
                  marginTop:-7,width:0,height:0,
                  borderTop:"7px solid transparent",
                  borderBottom:"7px solid transparent",
                  [left===px+12?"borderRight":"borderLeft"]:`7px solid ${GOLD}55`,
                }}/>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:ac,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:800,color:"#fff",
                    boxShadow:`0 2px 8px ${ac}66`,flexShrink:0}}>{d.initials}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:800,color:GOLD,lineHeight:1.2,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{"Coleman Ayers"===popup.name?"Coleman Ayers":popup.name} {d.flag}</div>
                    <div style={{fontSize:10,color:"rgba(226,221,159,0.5)",fontWeight:500}}>{d.role} · {d.org}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"rgba(226,221,159,0.65)",lineHeight:1.5,marginBottom:10}}>{d.bio}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"rgba(226,221,159,0.4)"}}>{d.posts} posts</span>
                  <button onClick={()=>onProfileClick(popup.name)} className="btn"
                    style={{fontSize:10,fontWeight:700,padding:"5px 11px",borderRadius:7,
                      background:GOLD,border:"none",color:"#111",cursor:"pointer"}}>
                    View Profile
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Legend */}
          <div style={{position:"absolute",bottom:10,right:12,
            display:"flex",alignItems:"center",gap:6,
            background:"rgba(0,0,0,0.55)",borderRadius:8,padding:"5px 10px",
            backdropFilter:"blur(4px)"}}>
            <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#1E1A0E" stroke={GOLD} strokeWidth="1.2"/></svg>
            <span style={{fontSize:9,color:"rgba(226,221,159,0.45)",fontWeight:600,letterSpacing:.5}}>TAP PIN FOR PROFILE</span>
          </div>
        </div>

        {/* Member strip */}
        <div style={{borderTop:"1px solid rgba(226,221,159,0.1)",
          borderRadius:"0 0 20px 20px",
          padding:"11px 16px",display:"flex",gap:8,flexWrap:"wrap",
          background:"#0E0E0C"}}>
          {MEMBER_PINS.map(pin=>{
            const isHov = hovered===pin.name;
            return (
              <div key={pin.name} className="btn"
                onClick={()=>setPopup(popup?.name===pin.name?null:{name:pin.name,x:pin.x,y:pin.y})}
                onMouseEnter={()=>setHovered(pin.name)}
                onMouseLeave={()=>setHovered(null)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",
                  borderRadius:10,
                  border:`1px solid ${isHov?"rgba(226,221,159,0.5)":"rgba(226,221,159,0.12)"}`,
                  background:isHov?"rgba(226,221,159,0.09)":"rgba(255,255,255,0.02)",
                  cursor:"pointer",transition:"all .15s"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:GOLD,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:9,fontWeight:800,color:"#111",flexShrink:0}}>{pin.initials}</div>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"rgba(226,221,159,0.88)",lineHeight:1.2}}>{pin.name}</div>
                  <div style={{fontSize:10,color:"rgba(226,221,159,0.4)",fontWeight:500}}>{pin.city}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ONBOARDING FLOW ──────────────────────────────────────────────────────
const ONBOARDING_CSS = `
@keyframes obFadeIn{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
@keyframes obPulseRing{0%{transform:scale(1);opacity:.6;}50%{transform:scale(1.15);opacity:1;}100%{transform:scale(1);opacity:.6;}}
@keyframes obGlow{0%,100%{box-shadow:0 0 20px rgba(226,221,159,0.15);}50%{box-shadow:0 0 40px rgba(226,221,159,0.35);}}
@keyframes obTourPulse{0%{box-shadow:0 0 0 0 rgba(226,221,159,0.5);}70%{box-shadow:0 0 0 12px rgba(226,221,159,0);}100%{box-shadow:0 0 0 0 rgba(226,221,159,0);}}
.ob-fade{animation:obFadeIn .5s ease both;}
.ob-btn{cursor:pointer;transition:opacity .15s,transform .1s;}
.ob-btn:hover{opacity:.85;}
.ob-btn:active{transform:scale(.97);}
.ob-input{outline:none;transition:border-color .2s;}
.ob-input:focus{border-color:#E2DD9F!important;}
.ob-pill{cursor:pointer;transition:all .15s ease;}
.ob-pill:hover{opacity:.85;}
.ob-tour-ring{animation:obTourPulse 1.5s ease-in-out infinite;}
`;

const OB_ROLES = ["Skills Trainer","Team Coach","Academy Coach","Parent/Player","College Coach","Pro Coach","Other"];
const OB_EXPERIENCE = ["Under 1 year","1\u20133 years","3\u20135 years","5\u201310 years","10+ years"];
const OB_AGE_GROUPS = ["Youth (under 12)","Middle School","High School","College","Pro","Mixed"];
const COUNTRY_FLAGS={"Afghanistan":"\ud83c\udde6\ud83c\uddeb","Albania":"\ud83c\udde6\ud83c\uddf1","Algeria":"\ud83c\udde9\ud83c\uddff","Andorra":"\ud83c\udde6\ud83c\udde9","Angola":"\ud83c\udde6\ud83c\uddf4","Antigua and Barbuda":"\ud83c\udde6\ud83c\uddec","Argentina":"\ud83c\udde6\ud83c\uddf7","Armenia":"\ud83c\udde6\ud83c\uddf2","Australia":"\ud83c\udde6\ud83c\uddfa","Austria":"\ud83c\udde6\ud83c\uddf9","Azerbaijan":"\ud83c\udde6\ud83c\uddff","Bahamas":"\ud83c\udde7\ud83c\uddf8","Bahrain":"\ud83c\udde7\ud83c\udded","Bangladesh":"\ud83c\udde7\ud83c\udde9","Barbados":"\ud83c\udde7\ud83c\udde7","Belarus":"\ud83c\udde7\ud83c\uddfe","Belgium":"\ud83c\udde7\ud83c\uddea","Belize":"\ud83c\udde7\ud83c\uddff","Benin":"\ud83c\udde7\ud83c\uddef","Bhutan":"\ud83c\udde7\ud83c\uddf9","Bolivia":"\ud83c\udde7\ud83c\uddf4","Bosnia and Herzegovina":"\ud83c\udde7\ud83c\udde6","Botswana":"\ud83c\udde7\ud83c\uddfc","Brazil":"\ud83c\udde7\ud83c\uddf7","Brunei":"\ud83c\udde7\ud83c\uddf3","Bulgaria":"\ud83c\udde7\ud83c\uddec","Burkina Faso":"\ud83c\udde7\ud83c\uddeb","Burundi":"\ud83c\udde7\ud83c\uddee","Cabo Verde":"\ud83c\udde8\ud83c\uddfb","Cambodia":"\ud83c\udde8\ud83c\uddf2","Cameroon":"\ud83c\udde8\ud83c\uddf2","Canada":"\ud83c\udde8\ud83c\udde6","Central African Republic":"\ud83c\udde8\ud83c\uddeb","Chad":"\ud83c\uddf9\ud83c\udde9","Chile":"\ud83c\udde8\ud83c\uddf1","China":"\ud83c\udde8\ud83c\uddf3","Colombia":"\ud83c\udde8\ud83c\uddf4","Comoros":"\ud83c\uddf0\ud83c\uddf2","Congo":"\ud83c\udde8\ud83c\uddec","Costa Rica":"\ud83c\udde8\ud83c\uddf7","Croatia":"\ud83c\udded\ud83c\uddf7","Cuba":"\ud83c\udde8\ud83c\uddfa","Cyprus":"\ud83c\udde8\ud83c\uddfe","Czech Republic":"\ud83c\udde8\ud83c\uddff","Denmark":"\ud83c\udde9\ud83c\uddf0","Djibouti":"\ud83c\udde9\ud83c\uddef","Dominica":"\ud83c\udde9\ud83c\uddf2","Dominican Republic":"\ud83c\udde9\ud83c\uddf4","DR Congo":"\ud83c\udde8\ud83c\udde9","Ecuador":"\ud83c\uddea\ud83c\udde8","Egypt":"\ud83c\uddea\ud83c\uddec","El Salvador":"\ud83c\uddf8\ud83c\uddfb","Equatorial Guinea":"\ud83c\uddec\ud83c\uddf6","Eritrea":"\ud83c\uddea\ud83c\uddf7","Estonia":"\ud83c\uddea\ud83c\uddea","Eswatini":"\ud83c\uddf8\ud83c\uddff","Ethiopia":"\ud83c\uddea\ud83c\uddf9","Fiji":"\ud83c\uddeb\ud83c\uddef","Finland":"\ud83c\uddeb\ud83c\uddee","France":"\ud83c\uddeb\ud83c\uddf7","Gabon":"\ud83c\uddec\ud83c\udde6","Gambia":"\ud83c\uddec\ud83c\uddf2","Georgia":"\ud83c\uddec\ud83c\uddea","Germany":"\ud83c\udde9\ud83c\uddea","Ghana":"\ud83c\uddec\ud83c\udded","Greece":"\ud83c\uddec\ud83c\uddf7","Grenada":"\ud83c\uddec\ud83c\udde9","Guatemala":"\ud83c\uddec\ud83c\uddf9","Guinea":"\ud83c\uddec\ud83c\uddf3","Guinea-Bissau":"\ud83c\uddec\ud83c\uddfc","Guyana":"\ud83c\uddec\ud83c\uddfe","Haiti":"\ud83c\udded\ud83c\uddf9","Honduras":"\ud83c\udded\ud83c\uddf3","Hungary":"\ud83c\udded\ud83c\uddfa","Iceland":"\ud83c\uddee\ud83c\uddf8","India":"\ud83c\uddee\ud83c\uddf3","Indonesia":"\ud83c\uddee\ud83c\udde9","Iran":"\ud83c\uddee\ud83c\uddf7","Iraq":"\ud83c\uddee\ud83c\uddf6","Ireland":"\ud83c\uddee\ud83c\uddea","Israel":"\ud83c\uddee\ud83c\uddf1","Italy":"\ud83c\uddee\ud83c\uddf9","Ivory Coast":"\ud83c\udde8\ud83c\uddee","Jamaica":"\ud83c\uddef\ud83c\uddf2","Japan":"\ud83c\uddef\ud83c\uddf5","Jordan":"\ud83c\uddef\ud83c\uddf4","Kazakhstan":"\ud83c\uddf0\ud83c\uddff","Kenya":"\ud83c\uddf0\ud83c\uddea","Kiribati":"\ud83c\uddf0\ud83c\uddee","Kosovo":"\ud83c\uddfd\ud83c\uddf0","Kuwait":"\ud83c\uddf0\ud83c\uddfc","Kyrgyzstan":"\ud83c\uddf0\ud83c\uddec","Laos":"\ud83c\uddf1\ud83c\udde6","Latvia":"\ud83c\uddf1\ud83c\uddfb","Lebanon":"\ud83c\uddf1\ud83c\udde7","Lesotho":"\ud83c\uddf1\ud83c\uddf8","Liberia":"\ud83c\uddf1\ud83c\uddf7","Libya":"\ud83c\uddf1\ud83c\uddfe","Liechtenstein":"\ud83c\uddf1\ud83c\uddee","Lithuania":"\ud83c\uddf1\ud83c\uddf9","Luxembourg":"\ud83c\uddf1\ud83c\uddfa","Madagascar":"\ud83c\uddf2\ud83c\uddec","Malawi":"\ud83c\uddf2\ud83c\uddfc","Malaysia":"\ud83c\uddf2\ud83c\uddfe","Maldives":"\ud83c\uddf2\ud83c\uddfb","Mali":"\ud83c\uddf2\ud83c\uddf1","Malta":"\ud83c\uddf2\ud83c\uddf9","Marshall Islands":"\ud83c\uddf2\ud83c\udded","Mauritania":"\ud83c\uddf2\ud83c\uddf7","Mauritius":"\ud83c\uddf2\ud83c\uddfa","Mexico":"\ud83c\uddf2\ud83c\uddfd","Micronesia":"\ud83c\uddeb\ud83c\uddf2","Moldova":"\ud83c\uddf2\ud83c\udde9","Monaco":"\ud83c\uddf2\ud83c\udde8","Mongolia":"\ud83c\uddf2\ud83c\uddf3","Montenegro":"\ud83c\uddf2\ud83c\uddea","Morocco":"\ud83c\uddf2\ud83c\udde6","Mozambique":"\ud83c\uddf2\ud83c\uddff","Myanmar":"\ud83c\uddf2\ud83c\uddf2","Namibia":"\ud83c\uddf3\ud83c\udde6","Nauru":"\ud83c\uddf3\ud83c\uddf7","Nepal":"\ud83c\uddf3\ud83c\uddf5","Netherlands":"\ud83c\uddf3\ud83c\uddf1","New Zealand":"\ud83c\uddf3\ud83c\uddff","Nicaragua":"\ud83c\uddf3\ud83c\uddee","Niger":"\ud83c\uddf3\ud83c\uddea","Nigeria":"\ud83c\uddf3\ud83c\uddec","North Korea":"\ud83c\uddf0\ud83c\uddf5","North Macedonia":"\ud83c\uddf2\ud83c\uddf0","Norway":"\ud83c\uddf3\ud83c\uddf4","Oman":"\ud83c\uddf4\ud83c\uddf2","Pakistan":"\ud83c\uddf5\ud83c\uddf0","Palau":"\ud83c\uddf5\ud83c\uddfc","Palestine":"\ud83c\uddf5\ud83c\uddf8","Panama":"\ud83c\uddf5\ud83c\udde6","Papua New Guinea":"\ud83c\uddf5\ud83c\uddec","Paraguay":"\ud83c\uddf5\ud83c\uddfe","Peru":"\ud83c\uddf5\ud83c\uddea","Philippines":"\ud83c\uddf5\ud83c\udded","Poland":"\ud83c\uddf5\ud83c\uddf1","Portugal":"\ud83c\uddf5\ud83c\uddf9","Puerto Rico":"\ud83c\uddf5\ud83c\uddf7","Qatar":"\ud83c\uddf6\ud83c\udde6","Romania":"\ud83c\uddf7\ud83c\uddf4","Russia":"\ud83c\uddf7\ud83c\uddfa","Rwanda":"\ud83c\uddf7\ud83c\uddfc","Saint Kitts and Nevis":"\ud83c\uddf0\ud83c\uddf3","Saint Lucia":"\ud83c\uddf1\ud83c\udde8","Saint Vincent and the Grenadines":"\ud83c\uddfb\ud83c\udde8","Samoa":"\ud83c\uddfc\ud83c\uddf8","San Marino":"\ud83c\uddf8\ud83c\uddf2","Sao Tome and Principe":"\ud83c\uddf8\ud83c\uddf9","Saudi Arabia":"\ud83c\uddf8\ud83c\udde6","Senegal":"\ud83c\uddf8\ud83c\uddf3","Serbia":"\ud83c\uddf7\ud83c\uddf8","Seychelles":"\ud83c\uddf8\ud83c\udde8","Sierra Leone":"\ud83c\uddf8\ud83c\uddf1","Singapore":"\ud83c\uddf8\ud83c\uddec","Slovakia":"\ud83c\uddf8\ud83c\uddf0","Slovenia":"\ud83c\uddf8\ud83c\uddee","Solomon Islands":"\ud83c\uddf8\ud83c\udde7","Somalia":"\ud83c\uddf8\ud83c\uddf4","South Africa":"\ud83c\uddff\ud83c\udde6","South Korea":"\ud83c\uddf0\ud83c\uddf7","South Sudan":"\ud83c\uddf8\ud83c\uddf8","Spain":"\ud83c\uddea\ud83c\uddf8","Sri Lanka":"\ud83c\uddf1\ud83c\uddf0","Sudan":"\ud83c\uddf8\ud83c\udde9","Suriname":"\ud83c\uddf8\ud83c\uddf7","Sweden":"\ud83c\uddf8\ud83c\uddea","Switzerland":"\ud83c\udde8\ud83c\udded","Syria":"\ud83c\uddf8\ud83c\uddfe","Taiwan":"\ud83c\uddf9\ud83c\uddfc","Tajikistan":"\ud83c\uddf9\ud83c\uddef","Tanzania":"\ud83c\uddf9\ud83c\uddff","Thailand":"\ud83c\uddf9\ud83c\udded","Timor-Leste":"\ud83c\uddf9\ud83c\uddf1","Togo":"\ud83c\uddf9\ud83c\uddec","Tonga":"\ud83c\uddf9\ud83c\uddf4","Trinidad and Tobago":"\ud83c\uddf9\ud83c\uddf9","Tunisia":"\ud83c\uddf9\ud83c\uddf3","Turkey":"\ud83c\uddf9\ud83c\uddf7","Turkmenistan":"\ud83c\uddf9\ud83c\uddf2","Tuvalu":"\ud83c\uddf9\ud83c\uddfb","UAE":"\ud83c\udde6\ud83c\uddea","Uganda":"\ud83c\uddfa\ud83c\uddec","Ukraine":"\ud83c\uddfa\ud83c\udde6","United Kingdom":"\ud83c\uddec\ud83c\udde7","United States":"\ud83c\uddfa\ud83c\uddf8","Uruguay":"\ud83c\uddfa\ud83c\uddfe","Uzbekistan":"\ud83c\uddfa\ud83c\uddff","Vanuatu":"\ud83c\uddfb\ud83c\uddfa","Vatican City":"\ud83c\uddfb\ud83c\udde6","Venezuela":"\ud83c\uddfb\ud83c\uddea","Vietnam":"\ud83c\uddfb\ud83c\uddf3","Yemen":"\ud83c\uddfe\ud83c\uddea","Zambia":"\ud83c\uddff\ud83c\uddf2","Zimbabwe":"\ud83c\uddff\ud83c\uddfc"};
const OB_COUNTRIES = Object.keys(COUNTRY_FLAGS).sort();
const OB_TOUR_STEPS = [
  {ids:["dashboard"],label:"Dashboard",desc:"This is your home base. Everything starts here.",type:"single"},
  {ids:["community"],label:"Community",desc:"Come back here and introduce yourself to the family. We want to know who you are.",type:"single"},
  {ids:["pd","insights"],label:"Player Development",desc:"This is where you'll become a better PD coach. Drills, games, and insights built for skill development.",type:"group",groupLabel:"Player Development"},
  {ids:["team","ti","xo"],label:"Team Coaching",desc:"If you coach teams, this is for you. Film, X&O, and team-specific tools all in one place.",type:"group",groupLabel:"Team Coaching"},
  {ids:["plans"],label:"Practice Plans",desc:"Build and save practice plans in minutes.",type:"single"},
  {ids:["master"],label:"Masterclasses",desc:"Deep dives from Coleman and guest coaches.",type:"single"},
  {ids:["workouts"],label:"Full Workouts",desc:"Complete workouts ready to run.",type:"single"},
  {ids:["playbook"],label:"Playbook Builder",desc:"Draw up plays and build your playbook visually.",type:"single"},
];

function SearchableDropdown({options,value,onChange,placeholder,style:{marginBottom:mb,...restStyle}={},renderLabel}){
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState("");
  const ref=useRef(null);
  const filtered=options.filter(o=>o.toLowerCase().includes(search.toLowerCase()));
  const label=renderLabel||(o=>o);
  useEffect(()=>{
    const handler=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",handler);return()=>document.removeEventListener("mousedown",handler);
  },[]);
  return(
    <div ref={ref} style={{position:"relative",width:"100%",maxWidth:420,marginBottom:mb||14}}>
      <div className="ob-input" onClick={()=>setOpen(!open)} tabIndex={0}
        style={{...restStyle,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:value?"#F5F0E8":"#666"}}>{value?label(value):placeholder}</span>
        <span style={{color:"#666",fontSize:10}}>▼</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:20,background:"#1A1A1A",border:"1px solid #333",borderRadius:10,maxHeight:220,overflow:"hidden",marginTop:2}}>
          <input autoFocus placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",padding:"10px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",background:"#222",color:"#F5F0E8",border:"none",borderBottom:"1px solid #333",outline:"none",boxSizing:"border-box"}}/>
          <div style={{maxHeight:170,overflowY:"auto"}}>
            {filtered.map(o=>(
              <div key={o} onClick={()=>{onChange(o);setOpen(false);setSearch("");}}
                style={{padding:"10px 14px",fontSize:13,color:o===value?GOLD:"#9A9488",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:o===value?"rgba(226,221,159,0.08)":"transparent"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(226,221,159,0.06)"}
                onMouseLeave={e=>e.currentTarget.style.background=o===value?"rgba(226,221,159,0.08)":"transparent"}>
                {label(o)}
              </div>
            ))}
            {filtered.length===0&&<div style={{padding:"10px 14px",fontSize:13,color:"#4A4840"}}>No results</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const BAM_LOGO_PNG="data:image/png;base64,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";

function OnboardingFlow({onComplete,onTourStart}){
  const [screen,setScreen]=useState(0);
  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("");
  const [firstNameErr,setFirstNameErr]=useState("");
  const [lastNameErr,setLastNameErr]=useState("");
  const [country,setCountry]=useState("");
  const [city,setCity]=useState("");
  const [roles,setRoles]=useState([]);
  const [customRole,setCustomRole]=useState("");
  const [experience,setExperience]=useState("");
  const [ageGroups,setAgeGroups]=useState([]);
  const [separates,setSeparates]=useState("");
  const [goal1yr,setGoal1yr]=useState("");
  const [goal10yr,setGoal10yr]=useState("");
  const [bio,setBio]=useState("");
  const [profilePhoto,setProfilePhoto]=useState(null);
  const [showLeaveModal,setShowLeaveModal]=useState(false);
  const photoInputRef=useRef(null);

  // Prompt 1: Back button interception
  useEffect(()=>{
    if(screen===0) return;
    const pushGuard=()=>window.history.pushState(null,"",window.location.href);
    pushGuard();
    const onPop=()=>{setShowLeaveModal(true);pushGuard();};
    window.addEventListener("popstate",onPop);
    const onBeforeUnload=(e)=>{e.preventDefault();e.returnValue="";};
    window.addEventListener("beforeunload",onBeforeUnload);
    return()=>{window.removeEventListener("popstate",onPop);window.removeEventListener("beforeunload",onBeforeUnload);};
  },[screen]);

  const confirmLeave=()=>{setShowLeaveModal(false);setScreen(0);};

  const togglePill=(val,arr,setter)=>{
    setter(arr.includes(val)?arr.filter(v=>v!==val):[...arr,val]);
  };

  // Prompt 4: Name validation
  const NAME_RE=/^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF\s'\-]*$/;
  const validateName=(val,setErr)=>{
    if(val&&!NAME_RE.test(val)){setErr("Please enter a valid name");return false;}
    setErr("");return true;
  };
  const handleNameChange=(val,setter,setErr)=>{
    if(val.length>50) return;
    setter(val);
    if(val&&!NAME_RE.test(val)) setErr("Please enter a valid name");
    else setErr("");
  };
  const handleNameBlur=(val,setter,setErr)=>{
    const trimmed=val.trim();
    setter(trimmed);
    validateName(trimmed,setErr);
  };

  // Prompt 5: effective role list (replace "Other" with custom text)
  const effectiveRoles=roles.map(r=>r==="Other"?customRole.trim()||"Other":r);

  const generateBio=useCallback(()=>{
    const location=city.trim()&&country?`${city.trim()}, ${country}`:country||city.trim();
    const rList=effectiveRoles.filter(Boolean);
    const roleStr=rList.length===1?rList[0]:rList.slice(0,-1).join(", ")+" and "+rList[rList.length-1];
    const expMap={"Under 1 year":"just getting started","1\u20133 years":"a few years in","3\u20135 years":"several years of experience","5\u201310 years":"over half a decade of experience","10+ years":"over a decade of experience"};
    const expPhrase=expMap[experience]||"experience";
    const ageStr=ageGroups.length===1?ageGroups[0].toLowerCase():ageGroups.slice(0,-1).map(a=>a.toLowerCase()).join(", ")+" and "+ageGroups[ageGroups.length-1].toLowerCase();
    const b=`I'm ${firstName}, a ${roleStr.toLowerCase()} based in ${location} with ${expPhrase} working with ${ageStr} athletes. ${separates.trim().replace(/\.$/,"")}. In the next year, my goal is to ${goal1yr.trim().toLowerCase().replace(/\.$/,"")}, and long-term I'm focused on ${goal10yr.trim().toLowerCase().replace(/\.$/,"")}.`;
    setBio(b);
  },[firstName,country,city,effectiveRoles,experience,ageGroups,separates,goal1yr,goal10yr]);

  useEffect(()=>{
    if(screen===5) generateBio();
  },[screen,generateBio]);

  const finish=()=>{
    try{localStorage.setItem("onboardingComplete","true");}catch(e){}
    try{if(firstName.trim()) localStorage.setItem("bam_user_name",firstName.trim());}catch(e){}
    onComplete();
  };

  const progress=(step,total)=>(
    <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:32}}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{width:i<=step?28:10,height:4,borderRadius:2,background:i<=step?GOLD:"#333",transition:"all .3s"}}/>
      ))}
    </div>
  );

  const pillBtn=(label,active,onClick)=>(
    <div key={label} className="ob-pill" onClick={onClick}
      style={{padding:"10px 20px",borderRadius:24,fontSize:13,fontWeight:active?700:500,
        background:active?GOLD:"transparent",color:active?"#111":"#9A9488",
        border:`1px solid ${active?GOLD:"#333"}`,fontFamily:"'DM Sans',sans-serif"}}>
      {label}
    </div>
  );

  const singlePill=(label,active,onClick)=>(
    <div key={label} className="ob-pill" onClick={onClick}
      style={{padding:"10px 20px",borderRadius:24,fontSize:13,fontWeight:active?700:500,
        background:active?GOLD:"transparent",color:active?"#111":"#9A9488",
        border:`1px solid ${active?GOLD:"#333"}`,fontFamily:"'DM Sans',sans-serif"}}>
      {label}
    </div>
  );

  const ctaBtn=(label,onClick,disabled)=>(
    <button className="ob-btn" onClick={onClick} disabled={disabled}
      style={{padding:"16px 48px",borderRadius:10,fontSize:15,fontWeight:800,letterSpacing:1.5,
        background:disabled?"#333":GOLD,color:disabled?"#666":"#111",border:"none",
        fontFamily:"'Bebas Neue',sans-serif",cursor:disabled?"not-allowed":"pointer",marginTop:20}}>
      {label}
    </button>
  );

  const inputStyle={width:"100%",maxWidth:420,padding:"14px 18px",borderRadius:10,fontSize:14,
    fontFamily:"'DM Sans',sans-serif",background:"#1A1A1A",color:"#F5F0E8",
    border:"1px solid #333",marginBottom:14,boxSizing:"border-box"};

  const dropdownStyle={padding:"14px 18px",borderRadius:10,fontSize:14,
    fontFamily:"'DM Sans',sans-serif",background:"#1A1A1A",color:"#F5F0E8",
    border:"1px solid #333"};

  const wrap={position:"fixed",inset:0,zIndex:10000,background:"#080808",display:"flex",
    flexDirection:"column",alignItems:"center",justifyContent:"center",
    fontFamily:"'DM Sans',sans-serif",overflow:"auto"};

  // Prompt 1: Leave confirmation modal
  const leaveModal=showLeaveModal&&(
    <div style={{position:"fixed",inset:0,zIndex:10001,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#1A1A1A",borderRadius:16,padding:"36px 40px",maxWidth:400,textAlign:"center",border:"1px solid #333"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"#F5F0E8",letterSpacing:1.5,marginBottom:12}}>ARE YOU SURE?</div>
        <div style={{fontSize:14,color:"#9A9488",lineHeight:1.7,marginBottom:28}}>Your progress will not be saved.</div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={()=>setShowLeaveModal(false)}
            style={{padding:"12px 32px",borderRadius:10,fontSize:14,fontWeight:800,letterSpacing:1,
              background:GOLD,color:"#111",border:"none",fontFamily:"'Bebas Neue',sans-serif",cursor:"pointer"}}>STAY</button>
          <button onClick={confirmLeave}
            style={{padding:"12px 32px",borderRadius:10,fontSize:14,fontWeight:800,letterSpacing:1,
              background:"transparent",color:"#9A9488",border:"1px solid #333",fontFamily:"'Bebas Neue',sans-serif",cursor:"pointer"}}>LEAVE</button>
        </div>
      </div>
    </div>
  );

  // Prompt 7: character count helper for identity fields
  const charCount=(val,min,max)=>(
    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:4}}>
      <span style={{color:val.length<min?"#E06060":"#4A4840"}}>{val.length<min?`${min-val.length} more characters needed`:""}</span>
      <span style={{color:max-val.length<=10?"#E06060":"#4A4840"}}>{val.length}/{max}</span>
    </div>
  );
  // Prompt 7: handle paste truncation
  const handleIdentityChange=(e,setter,max)=>{
    let v=e.target.value;
    if(v.length>max) v=v.slice(0,max);
    setter(v);
  };

  // Screen 0: Welcome
  if(screen===0) return (
    <div style={wrap}>
      <style>{ONBOARDING_CSS}</style>
      <div className="ob-fade" style={{textAlign:"center",padding:40}}>
        <img src={BAM_LOGO_PNG} alt="BAM" style={{width:70,height:88,objectFit:"contain",marginBottom:24,
          filter:"drop-shadow(0 0 24px rgba(226,221,159,0.35))"}}/>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:"#F5F0E8",lineHeight:1,
          letterSpacing:3,marginBottom:32}}>YOU'RE IN.</div>
        <div style={{fontSize:15,color:"#9A9488",lineHeight:1.8,maxWidth:480,margin:"0 auto 40px"}}>
          You just unlocked access to the<br/>
          <span style={{color:"#F5F0E8",fontWeight:600}}>DRILL LIBRARY</span> · <span style={{color:"#F5F0E8",fontWeight:600}}>COMMUNITY</span> · <span style={{color:"#F5F0E8",fontWeight:600}}>PRACTICE PLANS</span><br/>
          <span style={{color:"#F5F0E8",fontWeight:600}}>MASTERCLASSES</span> · <span style={{color:"#F5F0E8",fontWeight:600}}>X&O BREAKDOWNS</span> · <span style={{color:"#F5F0E8",fontWeight:600}}>FULL WORKOUTS</span>
        </div>
        {ctaBtn("LET'S BUILD",()=>setScreen(1))}
      </div>
    </div>
  );

  // Screen 1: Profile basics
  const nameValid=firstName.trim()&&!firstNameErr&&lastName.trim()&&!lastNameErr;
  const rolesValid=roles.length>0&&(roles.includes("Other")?customRole.trim().length>0:true);
  if(screen===1) return (
    <div style={wrap}>
      <style>{ONBOARDING_CSS}</style>
      {leaveModal}
      <div className="ob-fade" style={{textAlign:"center",padding:40,width:"100%",maxWidth:540}}>
        {progress(0,5)}
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:38,color:"#F5F0E8",letterSpacing:2,marginBottom:8}}>LET'S LEARN A BIT ABOUT YOU</div>
        <div style={{fontSize:13,color:"#4A4840",marginBottom:32}}>Step 1 of 4</div>
        <div style={{width:"100%",maxWidth:420,margin:"0 auto",textAlign:"left"}}>
          {/* Prompt 4: Name fields with validation */}
          <div style={{display:"flex",gap:10,marginBottom:4}}>
            <div style={{flex:1}}>
              <input className="ob-input" placeholder="First name" value={firstName}
                onChange={e=>handleNameChange(e.target.value,setFirstName,setFirstNameErr)}
                onBlur={()=>handleNameBlur(firstName,setFirstName,setFirstNameErr)}
                style={{...inputStyle,maxWidth:"100%",marginBottom:0,borderColor:firstNameErr?"#E06060":"#333"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginTop:2,minHeight:16}}>
                <span style={{color:"#E06060"}}>{firstNameErr}</span>
                {firstName.length>40&&<span style={{color:"#4A4840"}}>{firstName.length}/50</span>}
              </div>
            </div>
            <div style={{flex:1}}>
              <input className="ob-input" placeholder="Last name" value={lastName}
                onChange={e=>handleNameChange(e.target.value,setLastName,setLastNameErr)}
                onBlur={()=>handleNameBlur(lastName,setLastName,setLastNameErr)}
                style={{...inputStyle,maxWidth:"100%",marginBottom:0,borderColor:lastNameErr?"#E06060":"#333"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginTop:2,minHeight:16}}>
                <span style={{color:"#E06060"}}>{lastNameErr}</span>
                {lastName.length>40&&<span style={{color:"#4A4840"}}>{lastName.length}/50</span>}
              </div>
            </div>
          </div>
          {/* Prompt 2: Full country dropdown */}
          <SearchableDropdown options={OB_COUNTRIES} value={country} onChange={v=>{setCountry(v);setCity("");}} placeholder="Country" style={dropdownStyle}
            renderLabel={o=>COUNTRY_FLAGS[o]?`${COUNTRY_FLAGS[o]}  ${o}`:o}/>
          {/* Prompt 3: City free text input */}
          <input className="ob-input" placeholder="Enter your city" value={city} onChange={e=>setCity(e.target.value)}
            style={{...inputStyle,maxWidth:"100%"}}/>
        </div>
        {/* Prompt 5: Roles with "Other" option */}
        <div style={{fontSize:13,color:"#9A9488",marginBottom:12,marginTop:8,textAlign:"left"}}>Coaching role (select all that apply)</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:8}}>
          {OB_ROLES.map(r=>pillBtn(r,roles.includes(r),()=>togglePill(r,roles,setRoles)))}
        </div>
        {roles.includes("Other")&&(
          <input className="ob-input" placeholder="Tell us your role" value={customRole} onChange={e=>setCustomRole(e.target.value)}
            style={{...inputStyle,maxWidth:300,margin:"8px auto 0",textAlign:"center"}}/>
        )}
        {ctaBtn("NEXT",()=>setScreen(2),!nameValid||!country||city.trim().length<2||!rolesValid)}
      </div>
    </div>
  );

  // Screen 2: Coaching background
  // Prompt 6: Select All toggle
  const allAgesSelected=OB_AGE_GROUPS.every(a=>ageGroups.includes(a));
  const toggleAllAges=()=>{
    if(allAgesSelected) setAgeGroups([]);
    else setAgeGroups([...OB_AGE_GROUPS]);
  };
  if(screen===2) return (
    <div style={wrap}>
      <style>{ONBOARDING_CSS}</style>
      {leaveModal}
      <div className="ob-fade" style={{textAlign:"center",padding:40,width:"100%",maxWidth:540}}>
        {progress(1,5)}
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:"#F5F0E8",letterSpacing:2,marginBottom:8}}>YOUR COACHING STORY</div>
        <div style={{fontSize:13,color:"#4A4840",marginBottom:32}}>Step 2 of 4</div>
        <div style={{fontSize:13,color:"#9A9488",marginBottom:12,textAlign:"left"}}>How long have you been coaching?</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:24}}>
          {OB_EXPERIENCE.map(e=>singlePill(e,experience===e,()=>setExperience(e)))}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,textAlign:"left"}}>
          <div style={{fontSize:13,color:"#9A9488"}}>What age groups do you work with? (select all that apply)</div>
          <div className="ob-pill" onClick={toggleAllAges}
            style={{padding:"5px 14px",borderRadius:16,fontSize:11,fontWeight:700,cursor:"pointer",
              background:allAgesSelected?GOLD:"transparent",color:allAgesSelected?"#111":"#9A9488",
              border:`1px solid ${allAgesSelected?GOLD:"#333"}`,whiteSpace:"nowrap"}}>
            {allAgesSelected?"Deselect All":"Select All"}
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:8}}>
          {OB_AGE_GROUPS.map(a=>pillBtn(a,ageGroups.includes(a),()=>togglePill(a,ageGroups,setAgeGroups)))}
        </div>
        {ctaBtn("NEXT",()=>setScreen(3),!experience||ageGroups.length===0)}
      </div>
    </div>
  );

  // Screen 3: Profile photo upload
  const handlePhotoUpload=(e)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    if(file.size>5*1024*1024) return; // 5MB max
    const reader=new FileReader();
    reader.onload=(ev)=>setProfilePhoto(ev.target.result);
    reader.readAsDataURL(file);
  };
  if(screen===3) return (
    <div style={wrap}>
      <style>{ONBOARDING_CSS}</style>
      {leaveModal}
      <div className="ob-fade" style={{textAlign:"center",padding:40,width:"100%",maxWidth:540}}>
        {progress(2,5)}
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:"#F5F0E8",letterSpacing:2,marginBottom:8}}>YOUR PHOTO</div>
        <div style={{fontSize:13,color:"#4A4840",marginBottom:32}}>Step 3 of 5 — optional but recommended</div>
        <div onClick={()=>photoInputRef.current?.click()} className="btn" style={{width:120,height:120,borderRadius:"50%",margin:"0 auto 20px",
          background:profilePhoto?"transparent":"#242420",border:`2px dashed ${profilePhoto?GOLD:"#444"}`,
          display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",cursor:"pointer",
          boxShadow:profilePhoto?`0 4px 20px ${GOLD}33`:"none",transition:"all .2s"}}>
          {profilePhoto
            ?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
            :<div style={{textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:4,opacity:.5}}>📷</div>
              <div style={{fontSize:10,color:"#666"}}>Tap to upload</div>
            </div>
          }
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:"none"}}/>
        {profilePhoto&&<div className="btn" onClick={()=>setProfilePhoto(null)} style={{fontSize:12,color:"#E06060",marginBottom:8,cursor:"pointer"}}>Remove</div>}
        {!profilePhoto&&(
          <div style={{width:120,height:120,borderRadius:"50%",margin:"0 auto",background:getAC(firstName||"U"),
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:800,color:"#fff",
            boxShadow:`0 4px 20px ${getAC(firstName||"U")}55`,marginTop:-8,opacity:.5}}>
            {(firstName?.[0]||"").toUpperCase()}{(lastName?.[0]||"").toUpperCase()||""}
          </div>
        )}
        {!profilePhoto&&<div style={{fontSize:11,color:"#4A4840",marginTop:8,fontStyle:"italic"}}>This is your fallback avatar</div>}
        {ctaBtn(profilePhoto?"NEXT":"SKIP",()=>setScreen(4))}
      </div>
    </div>
  );

  // Screen 4: Coaching identity (20-500 char validation)
  const id3Valid=separates.trim().length>=20&&goal1yr.trim().length>=20&&goal10yr.trim().length>=20;
  if(screen===4) return (
    <div style={wrap}>
      <style>{ONBOARDING_CSS}</style>
      {leaveModal}
      <div className="ob-fade" style={{textAlign:"center",padding:40,width:"100%",maxWidth:540}}>
        {progress(3,5)}
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:"#F5F0E8",letterSpacing:2,marginBottom:8}}>WHAT DRIVES YOU</div>
        <div style={{fontSize:13,color:"#4A4840",marginBottom:32}}>Step 4 of 5</div>
        <div style={{textAlign:"left",marginBottom:14}}>
          <div style={{fontSize:13,color:"#9A9488",marginBottom:8}}>What separates you as a coach?</div>
          <textarea className="ob-input" placeholder="Be honest. What do you do differently?" value={separates}
            onChange={e=>handleIdentityChange(e,setSeparates,500)}
            style={{...inputStyle,height:80,resize:"none",marginBottom:0}}/>
          {charCount(separates,20,500)}
        </div>
        <div style={{textAlign:"left",marginBottom:14}}>
          <div style={{fontSize:13,color:"#9A9488",marginBottom:8}}>What's your goal as a coach in the next year?</div>
          <textarea className="ob-input" placeholder="Be specific." value={goal1yr}
            onChange={e=>handleIdentityChange(e,setGoal1yr,500)}
            style={{...inputStyle,height:64,resize:"none",marginBottom:0}}/>
          {charCount(goal1yr,20,500)}
        </div>
        <div style={{textAlign:"left",marginBottom:0}}>
          <div style={{fontSize:13,color:"#9A9488",marginBottom:8}}>What's your goal as a coach in the next 10 years?</div>
          <textarea className="ob-input" placeholder="Think big." value={goal10yr}
            onChange={e=>handleIdentityChange(e,setGoal10yr,500)}
            style={{...inputStyle,height:64,resize:"none",marginBottom:0}}/>
          {charCount(goal10yr,20,500)}
        </div>
        {ctaBtn("NEXT",()=>setScreen(5),!id3Valid)}
      </div>
    </div>
  );

  // Screen 5: Bio generation (editable, regenerate, 600 char limit)
  const bioOverLimit=bio.length>600;
  if(screen===5) return (
    <div style={wrap}>
      <style>{ONBOARDING_CSS}</style>
      {leaveModal}
      <div className="ob-fade" style={{textAlign:"center",padding:40,width:"100%",maxWidth:540}}>
        {progress(4,5)}
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:"#F5F0E8",letterSpacing:2,marginBottom:8}}>YOUR COACH BIO</div>
        <div style={{fontSize:14,color:"#9A9488",marginBottom:32}}>Based on your answers, we generated your bio. Edit it or use it as is.</div>
        <textarea className="ob-input" value={bio} onChange={e=>setBio(e.target.value)}
          style={{...inputStyle,maxWidth:"100%",height:140,resize:"vertical",lineHeight:1.7,fontSize:14,
            borderColor:bioOverLimit?"#E06060":"#333"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4,marginBottom:4}}>
          <span style={{fontSize:11,color:"#4A4840",fontStyle:"italic"}}>This is your starting point \u2014 make it yours.</span>
          <span style={{fontSize:11,color:bioOverLimit?"#E06060":"#4A4840"}}>{bio.length}/600</span>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:16}}>
          <button className="ob-btn" onClick={generateBio}
            style={{padding:"14px 36px",borderRadius:10,fontSize:14,fontWeight:800,letterSpacing:1,
              background:"transparent",color:GOLD,border:`1px solid ${GOLD}`,
              fontFamily:"'Bebas Neue',sans-serif",cursor:"pointer"}}>REGENERATE</button>
          {ctaBtn("LOOKS GOOD",()=>{if(onTourStart)onTourStart();},!bio.trim()||bioOverLimit)}
        </div>
      </div>
    </div>
  );

  return null;
}

function TourOverlay({onComplete,onNavigate}){
  const [tourStep,setTourStep]=useState(0);
  const [showLeaveModal,setShowLeaveModal]=useState(false);
  const tourData=OB_TOUR_STEPS[tourStep];
  const isLast=tourStep===OB_TOUR_STEPS.length-1;

  // Prompt 9: Back button interception during tour
  useEffect(()=>{
    const pushGuard=()=>window.history.pushState(null,"",window.location.href);
    pushGuard();
    const onPop=()=>{setShowLeaveModal(true);pushGuard();};
    window.addEventListener("popstate",onPop);
    const onBeforeUnload=(e)=>{e.preventDefault();e.returnValue="";};
    window.addEventListener("beforeunload",onBeforeUnload);
    return()=>{window.removeEventListener("popstate",onPop);window.removeEventListener("beforeunload",onBeforeUnload);};
  },[]);
  const TOUR_SIDEBAR=[
    {id:"dashboard",label:"Dashboard",Icon:LayoutDashboard,indent:0},
    {id:"community",label:"Community",Icon:Users,indent:0},
    {id:"_pd_header",label:"Player Development",Icon:Target,indent:0,isHeader:true},
    {id:"pd",label:"Drills & Games",Icon:Target,indent:1,parent:"pd"},
    {id:"insights",label:"Insights",Icon:Brain,indent:1,parent:"pd"},
    {id:"_team_header",label:"Team Coaching",Icon:Megaphone,indent:0,isHeader:true},
    {id:"team",label:"Drills & Games",Icon:Megaphone,indent:1,parent:"team"},
    {id:"ti",label:"Insights",Icon:Lightbulb,indent:1,parent:"team"},
    {id:"xo",label:"X & O Breakdowns",Icon:Clipboard,indent:1,parent:"team"},
    {id:"plans",label:"Practice Plans",Icon:FileText,indent:0},
    {id:"master",label:"Masterclasses",Icon:GraduationCap,indent:0},
    {id:"workouts",label:"Full Workouts",Icon:Zap,indent:0},
    {id:"playbook",label:"Playbook Builder",Icon:BookOpen,indent:0},
  ];
  const highlightIds=tourData.ids;
  const activeIds=[...highlightIds];
  if(tourData.type==="group"&&tourData.groupLabel==="Player Development") activeIds.push("_pd_header");
  if(tourData.type==="group"&&tourData.groupLabel==="Team Coaching") activeIds.push("_team_header");

  // Navigate to the highlighted page
  useEffect(()=>{
    if(onNavigate) onNavigate(tourData.ids[0]);
  },[tourStep,tourData.ids,onNavigate]);

  const finish=()=>{
    try{localStorage.setItem("onboardingComplete","true");}catch(e){}
    if(onNavigate) onNavigate("dashboard");
    onComplete();
  };

  const advance=()=>setTourStep(t=>t+1);

  // Track which item is the last active one (for anchoring the inline info)
  const lastActiveIdx=TOUR_SIDEBAR.reduce((acc,item,i)=>activeIds.includes(item.id)?i:acc,-1);

  return (
    <div style={{position:"fixed",inset:0,zIndex:10000,fontFamily:"'DM Sans',sans-serif",pointerEvents:"none"}}>
      <style>{ONBOARDING_CSS}</style>
      {/* Prompt 9: Leave modal during tour */}
      {showLeaveModal&&(
        <div style={{position:"fixed",inset:0,zIndex:10002,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"auto"}}>
          <div style={{background:"#1A1A1A",borderRadius:16,padding:"36px 40px",maxWidth:400,textAlign:"center",border:"1px solid #333"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"#F5F0E8",letterSpacing:1.5,marginBottom:12}}>ARE YOU SURE?</div>
            <div style={{fontSize:14,color:"#9A9488",lineHeight:1.7,marginBottom:28}}>Your progress will not be saved.</div>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button onClick={()=>setShowLeaveModal(false)}
                style={{padding:"12px 32px",borderRadius:10,fontSize:14,fontWeight:800,letterSpacing:1,
                  background:GOLD,color:"#111",border:"none",fontFamily:"'Bebas Neue',sans-serif",cursor:"pointer"}}>STAY</button>
              <button onClick={()=>{setShowLeaveModal(false);finish();}}
                style={{padding:"12px 32px",borderRadius:10,fontSize:14,fontWeight:800,letterSpacing:1,
                  background:"transparent",color:"#9A9488",border:"1px solid #333",fontFamily:"'Bebas Neue',sans-serif",cursor:"pointer"}}>LEAVE</button>
            </div>
          </div>
        </div>
      )}
      {/* Semi-transparent overlay */}
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",pointerEvents:"auto"}}/>
      {/* Sidebar highlight layer */}
      <div style={{position:"absolute",top:0,left:0,width:240,bottom:0,pointerEvents:"auto"}}>
        <div style={{position:"relative",height:"100%",display:"flex",flexDirection:"column"}}>
          <div style={{height:66,flexShrink:0}}/>
          <div style={{flex:1,padding:"10px 0",overflowY:"auto"}}>
            {TOUR_SIDEBAR.map((item,idx)=>{
              const isActive=activeIds.includes(item.id);
              const isHeader=item.isHeader;
              const isLastActive=idx===lastActiveIdx;
              if(!isActive) return <div key={item.id} style={{padding:item.indent?"7px 18px 7px 44px":`${isHeader?"10px":"9px"} 18px`,fontSize:isHeader?10:item.indent?12.5:13}}/>;
              return (
                <div key={item.id}>
                  <div style={{position:"relative",
                    padding:item.indent?"7px 18px 7px 44px":`${isHeader?"10px":"9px"} 18px`,
                    fontSize:isHeader?10:item.indent?12.5:13,
                    fontWeight:700,
                    color:isHeader?GOLD:"#F2F2F2",
                    background:isHeader?"rgba(226,221,159,0.08)":"rgba(226,221,159,0.12)",
                    borderLeft:isHeader?"3px solid transparent":`3px solid ${GOLD}`,
                    display:"flex",alignItems:"center",gap:isHeader?11:item.indent?10:11,
                    letterSpacing:isHeader?.8:0,textTransform:isHeader?"uppercase":"none",
                    borderRadius:6,margin:"0 6px"}}>
                    <item.Icon size={isHeader?15:item.indent?14:16} color={GOLD} strokeWidth={2.2}/>
                    {item.label}
                    <div className="ob-tour-ring" style={{position:"absolute",inset:-2,borderRadius:8,border:`2px solid ${GOLD}`,pointerEvents:"none"}}/>
                  </div>
                  {/* Inline info anchored directly below the last highlighted item */}
                  {isLastActive&&(
                    <div className="ob-fade" key={tourStep} style={{padding:"10px 18px 6px",pointerEvents:"auto"}}>
                      <div style={{fontSize:12,color:"#B0A898",lineHeight:1.5,marginBottom:10}}>{tourData.desc}</div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {isLast
                          ?<button className="ob-btn" onClick={finish}
                            style={{padding:"6px 18px",borderRadius:7,fontSize:12,fontWeight:800,letterSpacing:1,
                              background:GOLD,color:"#111",border:"none",fontFamily:"'Bebas Neue',sans-serif",cursor:"pointer"}}>
                            DONE
                          </button>
                          :<button className="ob-btn" onClick={advance}
                            style={{padding:"6px 16px",borderRadius:7,fontSize:12,fontWeight:700,
                              background:"transparent",color:GOLD,border:`1px solid ${GOLD}`,
                              fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>
                            Next →
                          </button>
                        }
                        <div style={{display:"flex",gap:3}}>
                          {OB_TOUR_STEPS.map((_,i)=>(
                            <div key={i} style={{width:i===tourStep?14:4,height:3,borderRadius:2,
                              background:i<=tourStep?GOLD:"#555",transition:"all .3s"}}/>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD INTRO ANIMATION ─────────────────────────────────────────────
function DashIntro({dark}){
  // 3 concentric rings, staggered
  const rings = [0, 180, 360];
  return (
    <div style={{
      position:"absolute",inset:0,zIndex:500,pointerEvents:"none",
      display:"flex",alignItems:"center",justifyContent:"center",
      animation:"introFade 2.8s ease forwards",
      background: dark
        ? "radial-gradient(ellipse at center, rgba(30,26,18,0.96) 0%, rgba(26,26,26,0.0) 70%)"
        : "radial-gradient(ellipse at center, rgba(255,252,240,0.96) 0%, rgba(255,255,255,0.0) 70%)",
    }}>
      {/* Shockwave rings */}
      {rings.map((delay,i)=>(
        <div key={i} style={{
          position:"absolute",
          width:90,height:90,borderRadius:"50%",
          border:`1.5px solid ${dark?"rgba(226,221,159,0.55)":"rgba(180,140,40,0.45)"}`,
          animation:`ringPulse 1.4s cubic-bezier(.2,.8,.4,1) ${delay}ms forwards`,
        }}/>
      ))}
      {/* Outer soft glow halo */}
      <div style={{
        position:"absolute",
        width:160,height:160,borderRadius:"50%",
        background:dark
          ? "radial-gradient(circle, rgba(226,221,159,0.14) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(200,160,50,0.18) 0%, transparent 70%)",
        animation:"ringPulse 1.8s ease 120ms forwards",
      }}/>
      {/* Microscope */}
      <img
        src="data:image/png;base64,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"
        style={{
          width:56,height:70,objectFit:"contain",position:"relative",zIndex:2,
          animation:"microDrop .72s cubic-bezier(.34,1.56,.64,1) forwards",
          filter:`drop-shadow(0 0 22px rgba(226,221,159,0.6)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))`,
        }}
      />
    </div>
  );
}

// ── MY PROFILE PANEL ───────────────────────────────────────────────────────
function MyProfilePanel({C, dark, onClose, profile, onProfileUpdate, photo, onPhotoUpdate, dismissedBanners, dismissBanner}){
  const [editing, setEditing] = useState(false);
  const [photoHover, setPhotoHover] = useState(false);
  const [draft, setDraft] = useState({...profile});
  const [draftPhoto, setDraftPhoto] = useState(photo);
  const photoRef = useRef(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  // Prompt 4: password change
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({current:"",newPw:"",confirm:""});
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState(false);
  // Prompt 5: email change
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(profile.email||"");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);
  // Prompt 6: stats loading
  const [profileStatsLoaded, setProfileStatsLoaded] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setProfileStatsLoaded(true),1200);return()=>clearTimeout(t);},[]);

  const initials = profile.name?.split(" ").map(w=>w[0]||"").join("").toUpperCase()||"";
  const firstName = profile.name?.split(" ")[0]||"";
  const lastName = profile.name?.split(" ").slice(1).join(" ")||"";

  // Prompt 3: validation
  const validate = () => {
    const errs = {};
    const parts = draft.name?.trim().split(/\s+/)||[];
    if(!parts[0]) errs.firstName = "First name is required";
    if(!parts.slice(1).join(" ").trim()) errs.lastName = "Last name is required";
    if(!draft.location?.trim()) errs.location = "Location is required";
    setEditErrors(errs);
    return Object.keys(errs).length===0;
  };

  const save = () => {
    if(!validate()) return;
    onProfileUpdate({...draft, bio:draft.bio||""});
    if(draftPhoto!==photo) onPhotoUpdate(draftPhoto);
    try{localStorage.setItem("bam_user_name",draft.name?.split(" ")[0]||"Coach");}catch{}
    setEditing(false); setEditErrors({});
  };
  const cancel = () => { setDraft({...profile}); setDraftPhoto(photo); setEditing(false); setEditErrors({}); };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDraftPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const inputStyle = (hasError) => ({
    width:"100%",background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",
    border:`1px solid ${hasError?"#E06060":dark?"rgba(226,221,159,0.3)":GOLD+"60"}`,borderRadius:8,
    padding:"8px 12px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"
  });

  // Prompt 4: password validation
  const submitPw = () => {
    const errs = {};
    if(pwForm.current!==profile.password) errs.current = "Current password is incorrect";
    if(pwForm.newPw.length<8) errs.newPw = "Password must be at least 8 characters";
    if(pwForm.confirm!==pwForm.newPw) errs.confirm = "Passwords do not match";
    setPwErrors(errs);
    if(Object.keys(errs).length>0) return;
    onProfileUpdate({...profile, password:pwForm.newPw});
    setPwSuccess(true);
    setTimeout(()=>{setPwModal(false);setPwSuccess(false);setPwForm({current:"",newPw:"",confirm:""});setPwErrors({});},1800);
  };

  // Prompt 5: email validation
  const saveEmail = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDraft.trim());
    if(!valid){ setEmailError("Please enter a valid email address"); return; }
    setEmailError("");
    onProfileUpdate({...profile, email:emailDraft.trim()});
    setEditingEmail(false);
    setEmailSuccess(true);
    setTimeout(()=>setEmailSuccess(false),2000);
  };

  // Prompt 6: stats based on role
  const roleStr = (profile.role||"").toLowerCase();
  const showPlans = roleStr.includes("coach")||roleStr.includes("trainer")||!roleStr;
  const profileStats = [
    ["Content Views","142"],["Community Posts","24"],
    ...(showPlans?[["Plans Created","7"]]:[] ),
    ["Playbooks Created","3"],["Days Active","47"],
  ];

  return (
    <div onClick={onClose}
      style={{position:"fixed",inset:0,zIndex:3000,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)"}}>
      <div onClick={e=>e.stopPropagation()}
        style={{position:"absolute",right:0,top:0,bottom:0,width:400,maxWidth:"100vw",
          background:dark?"#1E1E1E":"#fff",
          borderLeft:`1px solid ${dark?"#333":C.border}`,
          display:"flex",flexDirection:"column",
          animation:"slideR .28s cubic-bezier(.22,1,.36,1)"}}>

        {/* Header */}
        <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${dark?"#2E2E2E":C.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>My Profile</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {!editing
              ? <button onClick={()=>{setDraft({...profile});setDraftPhoto(photo);setEditing(true);}} className="btn"
                  style={{fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:7,
                    background:dark?"rgba(226,221,159,0.12)":"rgba(0,0,0,0.06)",
                    border:`1px solid ${dark?"rgba(226,221,159,0.25)":C.border}`,
                    color:dark?GOLD:"#111",cursor:"pointer"}}>
                  Edit
                </button>
              : <>
                  <button onClick={cancel} className="btn"
                    style={{fontSize:12,fontWeight:600,padding:"6px 12px",borderRadius:7,
                      background:"transparent",border:`1px solid ${dark?"#444":C.border}`,
                      color:C.textDim,cursor:"pointer"}}>Cancel</button>
                  <button onClick={save} className="btn"
                    style={{fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:7,
                      background:GOLD,border:"none",color:"#111",cursor:"pointer"}}>Save</button>
                </>
            }
            <div className="btn" onClick={onClose}
              style={{width:30,height:30,borderRadius:7,display:"flex",alignItems:"center",
                justifyContent:"center",background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",
                cursor:"pointer",fontSize:16,color:C.textDim}}>×</div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{flex:1,overflowY:"auto",padding:"22px"}}>

          {/* Avatar + name */}
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
            <div style={{position:"relative",flexShrink:0}}
              onMouseEnter={()=>setPhotoHover(true)} onMouseLeave={()=>setPhotoHover(false)}>
              <div style={{width:64,height:64,borderRadius:"50%",overflow:"hidden",
                background:GOLD,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:20,fontWeight:800,color:"#111",
                boxShadow:`0 0 0 3px ${dark?"#1E1E1E":"#fff"}, 0 0 0 4px ${GOLD}55`}}>
                {(editing?draftPhoto:photo)
                  ? <img src={editing?draftPhoto:photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : initials}
              </div>
              {editing && (
                <div onClick={()=>photoRef.current?.click()}
                  style={{position:"absolute",inset:0,borderRadius:"50%",
                    background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",
                    justifyContent:"center",cursor:"pointer",opacity:photoHover?1:0,transition:"opacity .15s"}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.3}}>CHANGE<br/>PHOTO</span>
                </div>
              )}
              <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
              <div style={{position:"absolute",bottom:2,right:2,width:14,height:14,borderRadius:"50%",
                background:"#5AB584",border:`2px solid ${dark?"#1E1E1E":"#fff"}`}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              {editing ? (
                <div>
                  <div style={{display:"flex",gap:6,marginBottom:4}}>
                    <div style={{flex:1}}>
                      <input value={draft.name?.split(" ")[0]||""} placeholder="First name"
                        onChange={e=>{const last=draft.name?.split(" ").slice(1).join(" ")||"";setDraft(p=>({...p,name:(e.target.value+" "+last).trim()}));}}
                        style={{...inputStyle(editErrors.firstName),fontSize:14,fontWeight:800}}/>
                      {editErrors.firstName&&<div style={{fontSize:10,color:"#E06060",marginTop:2}}>{editErrors.firstName}</div>}
                    </div>
                    <div style={{flex:1}}>
                      <input value={draft.name?.split(" ").slice(1).join(" ")||""} placeholder="Last name"
                        onChange={e=>{const first=draft.name?.split(" ")[0]||"";setDraft(p=>({...p,name:(first+" "+e.target.value).trim()}));}}
                        style={{...inputStyle(editErrors.lastName),fontSize:14,fontWeight:800}}/>
                      {editErrors.lastName&&<div style={{fontSize:10,color:"#E06060",marginTop:2}}>{editErrors.lastName}</div>}
                    </div>
                  </div>
                  <input value={draft.handle} onChange={e=>setDraft(p=>({...p,handle:e.target.value}))}
                    style={{...inputStyle(false),fontSize:12,color:C.textDim,marginTop:4}}/>
                </div>
              ) : (
                <>
                  <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:3}}>{profile.name}</div>
                  <div style={{fontSize:12,color:GOLD,fontWeight:600}}>{profile.handle}</div>
                </>
              )}
            </div>
          </div>

          {/* Certs badges */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:22}}>
            {(profile.certs||[]).map((c,i)=>(
              <div key={i} style={{fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20,
                background:i===0?GOLD:dark?"rgba(226,221,159,0.1)":"rgba(0,0,0,0.06)",
                color:i===0?"#111":GOLD,
                border:i===0?"none":`1px solid ${dark?"rgba(226,221,159,0.25)":GOLD+"50"}`,
                letterSpacing:.4}}>{c}</div>
            ))}
          </div>

          {/* Fields — Prompt 1: hide empty fields in view mode */}
          {[
            {label:"Role", field:"role"},
            {label:"Organization", field:"org"},
            {label:"Location", field:"location"},
          ].map(({label,field})=>{
            if(!editing && !profile[field]) return null;
            return (
              <div key={field} style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:dark?GOLD+"99":"#999",
                  letterSpacing:1.2,textTransform:"uppercase",marginBottom:5}}>{label}</div>
                {editing
                  ? <div>
                      <input value={draft[field]||""} onChange={e=>setDraft(p=>({...p,[field]:e.target.value}))}
                        style={inputStyle(editErrors[field])}/>
                      {editErrors[field]&&<div style={{fontSize:10,color:"#E06060",marginTop:2}}>{editErrors[field]}</div>}
                    </div>
                  : <div style={{fontSize:13,color:C.text,fontWeight:500}}>{profile[field]}</div>}
              </div>
            );
          })}

          {/* Bio — Prompt 1: truncate at 3 lines with Read more */}
          {(editing || profile.bio) && (
            <div style={{marginBottom:18}}>
              <div style={{fontSize:10,fontWeight:700,color:dark?GOLD+"99":"#999",
                letterSpacing:1.2,textTransform:"uppercase",marginBottom:5}}>Bio</div>
              {editing ? (
                <div>
                  <textarea value={draft.bio||""} onChange={e=>{if(e.target.value.length<=600)setDraft(p=>({...p,bio:e.target.value}));}}
                    style={{width:"100%",background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",
                      border:`1px solid ${dark?"rgba(226,221,159,0.3)":GOLD+"60"}`,borderRadius:8,
                      padding:"9px 12px",fontSize:13,color:C.text,resize:"none",height:80,
                      fontFamily:"inherit",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
                  <div style={{fontSize:10,color:(draft.bio||"").length>=580?"#E06060":C.textDim,textAlign:"right",marginTop:3}}>{(draft.bio||"").length}/600</div>
                </div>
              ) : (
                <div>
                  <div style={{fontSize:13,color:C.textMid,lineHeight:1.6,
                    ...(bioExpanded?{}:{display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"})}}>
                    {profile.bio}
                  </div>
                  {profile.bio && profile.bio.length>120 && !bioExpanded && (
                    <div onClick={()=>setBioExpanded(true)}
                      style={{fontSize:12,color:GOLD,fontWeight:600,cursor:"pointer",marginTop:4}}>Read more</div>
                  )}
                  {bioExpanded && (
                    <div onClick={()=>setBioExpanded(false)}
                      style={{fontSize:12,color:GOLD,fontWeight:600,cursor:"pointer",marginTop:4}}>Show less</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{height:1,background:dark?"#2E2E2E":C.border,margin:"18px 0"}}/>

          {/* Social links — hide empty in view mode */}
          <div style={{marginBottom:6}}>
            <div style={{fontSize:10,fontWeight:700,color:dark?GOLD+"99":"#999",
              letterSpacing:1.2,textTransform:"uppercase",marginBottom:12}}>Socials</div>
            {[
              {label:"Instagram", field:"ig",  icon:"📷", prefix:"@"},
              {label:"X",         field:"x",   icon:"𝕏",  prefix:"@"},
              {label:"Website",   field:"website", icon:"🌐", prefix:""},
            ].map(({label,field,icon,prefix})=>{
              if(!editing && !profile[field]) return null;
              return (
                <div key={field} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:14,width:20,flexShrink:0}}>{icon}</span>
                  {editing
                    ? <input value={draft[field]||""} onChange={e=>setDraft(p=>({...p,[field]:e.target.value}))}
                        placeholder={label}
                        style={{flex:1,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",
                          border:`1px solid ${dark?"rgba(226,221,159,0.25)":C.border}`,borderRadius:7,
                          padding:"7px 10px",fontSize:12,color:C.text,outline:"none",fontFamily:"inherit"}}/>
                    : <span style={{fontSize:13,color:GOLD,fontWeight:500}}>{prefix}{profile[field]}</span>
                  }
                </div>
              );
            })}
          </div>

          <div style={{height:1,background:dark?"#2E2E2E":C.border,margin:"18px 0"}}/>

          {/* Prompt 6: Stats strip with shimmer */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,fontWeight:700,color:dark?GOLD+"99":"#999",
              letterSpacing:1.2,textTransform:"uppercase",marginBottom:12}}>Stats</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {profileStats.map(([l,v])=>(
                <div key={l} style={{background:dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",
                  borderRadius:10,padding:"12px 14px",border:`1px solid ${dark?"#2A2A2A":C.border}`}}>
                  {profileStatsLoaded?(
                    <div style={{fontSize:20,fontWeight:800,color:dark?GOLD:"#111",marginBottom:2}}>{v||"0"}</div>
                  ):(
                    <div style={{width:36,height:20,borderRadius:5,background:dark?"#333":"#e8e8e8",overflow:"hidden",position:"relative",marginBottom:2}}>
                      <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)"},transparent)`,animation:"bamShimmer 1.5s ease-in-out infinite"}}/>
                    </div>
                  )}
                  <div style={{fontSize:10,color:C.textDim,fontWeight:600,textTransform:"uppercase",letterSpacing:.8}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt 7: Profile cert banner */}
          {dismissBanner&&!(dismissedBanners||[]).includes("profile-cert")&&(
            <div style={{background:dark?"rgba(226,221,159,0.06)":"rgba(226,221,159,0.12)",border:`1px solid ${GOLD}44`,
              borderRadius:10,padding:"14px 16px",marginTop:18,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",position:"relative"}}>
              <div className="btn" onClick={()=>dismissBanner("profile-cert")} style={{position:"absolute",top:6,right:10,fontSize:12,color:C.textDim,cursor:"pointer"}}>×</div>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontSize:13,color:C.text,fontWeight:600}}>Take your coaching further</div>
                <div style={{fontSize:11,color:C.textDim,marginTop:2}}>Get BAM Certified</div>
              </div>
              <a href="https://byanymeanscoaches.com/certification" target="_blank" rel="noopener noreferrer"
                style={{padding:"7px 16px",borderRadius:7,background:GOLD,color:"#111",fontSize:11,fontWeight:800,textDecoration:"none",flexShrink:0}}>
                Get Certified
              </a>
            </div>
          )}

          <div style={{height:1,background:dark?"#2E2E2E":C.border,margin:"18px 0"}}/>

          {/* Prompt 4 & 5: Account section */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:dark?GOLD+"99":"#999",
              letterSpacing:1.2,textTransform:"uppercase",marginBottom:12}}>Account</div>

            {/* Email */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:600,color:C.textDim,marginBottom:5,textTransform:"uppercase",letterSpacing:.8}}>Email</div>
              {editingEmail?(
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <input value={emailDraft} onChange={e=>{setEmailDraft(e.target.value);setEmailError("");}}
                      style={inputStyle(!!emailError)} autoFocus/>
                    {emailError&&<div style={{fontSize:10,color:"#E06060",marginTop:2}}>{emailError}</div>}
                  </div>
                  <button onClick={saveEmail}
                    style={{padding:"8px 14px",borderRadius:7,background:GOLD,border:"none",color:"#111",
                      fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>Save</button>
                  <button onClick={()=>{setEditingEmail(false);setEmailDraft(profile.email||"");setEmailError("");}}
                    style={{padding:"8px 10px",borderRadius:7,border:`1px solid ${dark?"#444":C.border}`,
                      background:"transparent",color:C.textDim,fontSize:12,cursor:"pointer",flexShrink:0}}>×</button>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13,color:C.text}}>{profile.email||"Not set"}</span>
                  <Pen size={12} color={C.textDim} style={{cursor:"pointer"}} onClick={()=>{setEmailDraft(profile.email||"");setEditingEmail(true);}}/>
                  {emailSuccess&&<span style={{fontSize:11,color:GOLD,fontWeight:600,animation:"bamFadeOut 2s forwards"}}>Email updated</span>}
                </div>
              )}
            </div>

            {/* Change Password */}
            <button onClick={()=>setPwModal(true)}
              style={{padding:"10px 18px",borderRadius:9,border:`1px solid ${dark?"#444":C.border}`,
                background:"transparent",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer",width:"100%",textAlign:"left"}}>
              Change Password
            </button>
          </div>

        </div>
      </div>

      {/* Prompt 4: Password change modal */}
      {pwModal&&(
        <div onClick={e=>e.stopPropagation()}
          style={{position:"fixed",inset:0,zIndex:3500,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
          <div style={{background:dark?"#1E1E1E":"#fff",borderRadius:14,padding:"28px 28px",width:360,maxWidth:"90vw",
            border:`1px solid ${dark?"#333":C.border}`,boxShadow:`0 20px 60px rgba(0,0,0,0.5)`}}>
            {pwSuccess?(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:18,fontWeight:800,color:GOLD,marginBottom:8}}>Password updated successfully</div>
              </div>
            ):(
              <>
                <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:20}}>Change Password</div>
                {[
                  {label:"Current Password",key:"current",err:pwErrors.current},
                  {label:"New Password",key:"newPw",err:pwErrors.newPw},
                  {label:"Confirm New Password",key:"confirm",err:pwErrors.confirm},
                ].map(({label,key,err})=>(
                  <div key={key} style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.textDim,marginBottom:4}}>{label}</div>
                    <input type="password" value={pwForm[key]}
                      onChange={e=>setPwForm(p=>({...p,[key]:e.target.value}))}
                      style={{...inputStyle(!!err),width:"100%"}}/>
                    {err&&<div style={{fontSize:10,color:"#E06060",marginTop:2}}>{err}</div>}
                  </div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button onClick={submitPw}
                    style={{flex:1,padding:"10px",borderRadius:8,background:GOLD,border:"none",color:"#111",fontWeight:800,fontSize:13,cursor:"pointer"}}>
                    Update Password
                  </button>
                  <button onClick={()=>{setPwModal(false);setPwForm({current:"",newPw:"",confirm:""});setPwErrors({});}}
                    style={{padding:"10px 16px",borderRadius:8,border:`1px solid ${dark?"#444":C.border}`,
                      background:"transparent",color:C.textDim,fontSize:13,cursor:"pointer"}}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── RESOURCES PAGE ────────────────────────────────────────────────────────

const BAM_PRODUCTS = [
  { id:"blueprint", title:"Modern Basketball Blueprint", img:"/images/blueprint.jpg", url:"https://byanymeanscoaches.com/blueprint-book", desc:"A comprehensive guide to building a modern basketball program from the ground up. Covers philosophy, practice design, player development frameworks, and more." },
  { id:"deep-skill", title:"Deep Skill", img:"/images/deep-skill.png", url:"https://byanymeanscoaches.com/deep-skill", desc:"Master the science of skill acquisition. Learn constraint-led approaches, differential learning, and how to design training environments that accelerate development." },
  { id:"certification", title:"Coaches Certification", img:"/images/certification.png", url:"https://byanymeanscoaches.com/certification", desc:"Get BAM certified. A structured program covering modern coaching methodology, with video modules, assessments, and a community of certified coaches." },
  { id:"consulting", title:"Coaches Consulting", img:"/images/consulting.png", url:"https://byanymeanscoaches.com/education", desc:"1-on-1 and group consulting sessions with BAM coaches. Get personalized feedback on your program, practice plans, and coaching philosophy." },
  { id:"retreats", title:"Retreats", img:"/images/retreats.png", url:"https://byanymeanscoaches.com/retreats", desc:"Immersive in-person coaching retreats. Network with like-minded coaches, attend workshops, and experience hands-on training sessions." },
];

const PAPER_TAGS = ["Skill Acquisition","Ecological Dynamics","Psychology","Athletic Performance","Other"];

const MOCK_PAPERS = [
  { id:1, title:"Constraints-Led Approach to Skill Acquisition in Sport", authors:"Davids, K., Button, C., & Bennett, S.", year:2008, journal:"International Journal of Sport Psychology", abstract:"This paper examines how manipulating task, environmental, and organismic constraints can guide learners toward functional movement solutions without prescriptive instruction. The constraints-led approach offers coaches a principled framework for designing practice tasks that channel athletes toward discovering effective movement patterns, rather than imposing rigid technique models.", tags:["Skill Acquisition","Ecological Dynamics"], strength_of_evidence:"Strong", doi_url:"https://doi.org/10.1080/17461390802067545", ai_summary:null },
  { id:2, title:"Nonlinear Pedagogy in Skill Acquisition", authors:"Chow, J.Y., Davids, K., Button, C., & Renshaw, I.", year:2016, journal:"Routledge Research in Sport Science", abstract:"Explores how nonlinear pedagogy provides a framework for understanding skill acquisition as a complex, self-organizing process shaped by interacting constraints. This approach emphasizes variability in practice, representative learning design, and the manipulation of key task constraints to facilitate the emergence of functional movement solutions.", tags:["Skill Acquisition","Ecological Dynamics"], strength_of_evidence:"Strong", doi_url:"https://doi.org/10.4324/9781315813042", ai_summary:null },
  { id:3, title:"Ecological Dynamics and Transfer of Learning in Sport", authors:"Rosalie, S.M. & Mueller, F.", year:2014, journal:"Sports Medicine", abstract:"Reviews the ecological dynamics approach to understanding how skills learned in practice transfer to competitive performance environments. Argues that transfer depends on the degree to which information-movement couplings developed in training are preserved in competition contexts.", tags:["Ecological Dynamics","Athletic Performance"], strength_of_evidence:"Moderate", doi_url:"https://doi.org/10.1007/s40279-014-0236-z", ai_summary:null },
  { id:4, title:"Self-Determination Theory and the Psychology of Exercise", authors:"Deci, E.L. & Ryan, R.M.", year:2012, journal:"International Review of Sport and Exercise Psychology", abstract:"Examines how autonomy, competence, and relatedness needs influence intrinsic motivation in athletes. Coaches who support these basic psychological needs foster greater engagement, persistence, and well-being in their players.", tags:["Psychology"], strength_of_evidence:"Strong", doi_url:"https://doi.org/10.1080/1750984X.2012.676658", ai_summary:null },
  { id:5, title:"Periodization of Strength Training for Basketball", authors:"Bompa, T.O. & Buzzichelli, C.", year:2019, journal:"Journal of Strength and Conditioning Research", abstract:"Provides evidence-based guidelines for structuring seasonal strength and conditioning programs for basketball athletes. Covers load management, plyometric integration, and in-season maintenance protocols tailored to the demands of competitive basketball schedules.", tags:["Athletic Performance"], strength_of_evidence:"Moderate", doi_url:"https://doi.org/10.1519/JSC.0000000000003198", ai_summary:null },
  { id:6, title:"Growth Mindset and Athletic Development in Youth Sport", authors:"Dweck, C.S. & Yeager, D.S.", year:2019, journal:"Annual Review of Psychology", abstract:"Reviews how a growth mindset—the belief that abilities can be developed through effort and learning—impacts youth athlete development, resilience in the face of setbacks, and long-term engagement in sport. Preliminary evidence suggests mindset interventions can reduce dropout rates.", tags:["Psychology","Other"], strength_of_evidence:"Preliminary", doi_url:"https://doi.org/10.1146/annurev-psych-010418-103311", ai_summary:null },
];

const MOCK_BOOKS = [
  { id:1, title:"The Talent Code", author:"Daniel Coyle", url:"https://www.amazon.com/Talent-Code-Greatness-Born-Grown/dp/055380684X", desc:"Unlocking the secret of skill development through deep practice, ignition, and master coaching." },
  { id:2, title:"Range: Why Generalists Triumph in a Specialized World", author:"David Epstein", url:"https://www.amazon.com/Range-Generalists-Triumph-Specialized-World/dp/0735214484", desc:"Why breadth of experience and late specialization often outperform early, narrow focus in sports and beyond." },
  { id:3, title:"Bounce: Mozart, Federer, Picasso, Beckham, and the Science of Success", author:"Matthew Syed", url:"https://www.amazon.com/Bounce-Mozart-Federer-Picasso-Beckham/dp/0061723762", desc:"A former Olympic athlete examines the role of practice, mindset, and opportunity in achieving greatness." },
];

function ResourcesPage({C, dark, dismissedBanners, dismissBanner}){
  const [expanded, setExpanded] = useState(null);
  const [collapsingId, setCollapsingId] = useState(null);
  const [summaries, setSummaries] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem("bam_ai_summaries")||"{}"); }catch{ return {}; }
  });
  const [loadingSummary, setLoadingSummary] = useState(null);
  const [paperTag, setPaperTag] = useState("All");
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [prodImgErr, setProdImgErr] = useState({});
  const [doiErr, setDoiErr] = useState({});
  const [bookImgErr, setBookImgErr] = useState({});
  const [pageReady, setPageReady] = useState(false);

  // Prompt 10: loading state
  useEffect(()=>{const t=setTimeout(()=>setPageReady(true),600);return ()=>clearTimeout(t);},[]);

  // Prompt 2: single expansion — collapse current before opening new
  const toggleExpand = (id) => {
    if(expanded===id){setExpanded(null);return;}
    if(expanded!==null){setCollapsingId(expanded);setExpanded(null);setTimeout(()=>{setCollapsingId(null);setExpanded(id);},250);}
    else setExpanded(id);
  };

  const generateSummary = async (paper) => {
    // Prompt 5: check localStorage cache first
    if (summaries[paper.id]) return;
    setLoadingSummary(paper.id);
    try {
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),15000);
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [{ role: "user", content: `Summarize this research paper in 3-4 concise bullet points for basketball coaches. Title: "${paper.title}" by ${paper.authors} (${paper.year}). Abstract: ${paper.abstract}` }],
        }),
        signal:controller.signal,
      });
      clearTimeout(timeout);
      const data = await resp.json();
      const text = data?.content?.[0]?.text || null;
      if(text){
        const updated={...summaries,[paper.id]:text};
        setSummaries(updated);
        try{localStorage.setItem("bam_ai_summaries",JSON.stringify(updated));}catch{}
      } else {
        setSummaries(prev=>({...prev,[paper.id]:"__error__"}));
      }
    } catch {
      setSummaries(prev=>({...prev,[paper.id]:"__error__"}));
    }
    setLoadingSummary(null);
  };

  const sectionColor = dark ? GOLD : "#1A1A1A";
  const sectionTitle = (text) => (
    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:sectionColor,letterSpacing:2,marginBottom:16,marginTop:36}}>{text}</div>
  );

  const filteredPapers = MOCK_PAPERS.filter(p=>paperTag==="All"||p.tags.includes(paperTag));

  // Prompt 10: loading screen
  if(!pageReady) return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:dark?"#0D0D0D":"#F5F5F5"}}>
      <img src={BAM_LOGO_PNG} alt="BAM" style={{width:64,height:64,objectFit:"contain",animation:"bamPulse 1.5s ease-in-out infinite"}} />
      <style>{`@keyframes bamPulse{0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(1.15);opacity:1}}`}</style>
    </div>
  );

  return (
    <div style={{flex:1,overflow:"auto",padding:28,animation:"bamFadeIn .4s ease",opacity:1}}>
      <style>{`@keyframes bamFadeIn{from{opacity:0}to{opacity:1}}`}</style>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{marginBottom:8}}>
          <div style={{fontSize:24,fontWeight:800,color:C.text,letterSpacing:.5}}>Resources</div>
          <div style={{fontSize:14,color:C.textDim,marginTop:4}}>Products, research, books, and tools to level up your coaching.</div>
        </div>

        {/* BAM Products */}
        {sectionTitle("BAM PRODUCTS")}
        {/* Prompt 3: single column on mobile via CSS media query */}
        <style>{`@media(max-width:600px){.bam-products-grid{grid-template-columns:1fr !important}}`}</style>
        <div className="bam-products-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
          {BAM_PRODUCTS.map(p=>{
            const isOpen=expanded===p.id;
            const isCollapsing=collapsingId===p.id;
            return (
            <div key={p.id} style={{background:C.bgCard,border:`1px solid ${isOpen?GOLD+"60":C.border}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"border-color .2s,box-shadow .2s",boxShadow:isOpen?`0 0 0 2px ${GOLD}20`:"none"}}
              onClick={()=>toggleExpand(p.id)}>
              {/* Prompt 4: broken product image placeholder */}
              <div style={{height:160,background:dark?"#2A2A2A":"#E8E8E8",overflow:"hidden",position:"relative"}}>
                {prodImgErr[p.id]?(
                  <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${GOLD}30`,borderRadius:0,background:dark?"#1A1A1A":"#E0E0E0"}}>
                    <img src={BAM_LOGO_PNG} alt="BAM" style={{width:40,height:40,objectFit:"contain",opacity:.5}} />
                  </div>
                ):(
                  <img src={p.img} alt={p.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                    onError={()=>setProdImgErr(prev=>({...prev,[p.id]:true}))} />
                )}
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(transparent,rgba(0,0,0,0.7))"}} />
              </div>
              <div style={{padding:"14px 16px"}}>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>{p.title}</div>
                <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:GOLD,fontWeight:600}}>
                  {isOpen?"Collapse":"Learn more"} <ChevronDown size={12} style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s"}} />
                </div>
              </div>
              {/* Prompt 2: smooth expand/collapse */}
              <div style={{maxHeight:isOpen?300:0,overflow:"hidden",transition:"max-height .25s ease",opacity:isOpen?1:0}}>
                <div style={{padding:"0 16px 16px"}} onClick={e=>e.stopPropagation()}>
                  <div style={{fontSize:13,color:C.textMid,lineHeight:1.6,marginBottom:14}}>{p.desc}</div>
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    style={{display:"inline-flex",alignItems:"center",gap:6,background:GOLD,color:"#111",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700,textDecoration:"none",fontFamily:"'DM Sans',sans-serif",minHeight:44}}>
                    Visit <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          );})}
        </div>

        {/* Podcast */}
        {sectionTitle("PODCAST")}
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:24,display:"flex",alignItems:"center",gap:20}}>
          <div style={{width:64,height:64,borderRadius:14,background:dark?"#2A2A2A":"#E8E8E8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Headphones size={28} color={GOLD} />
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>By Any Means Podcast</div>
            <div style={{fontSize:13,color:C.textDim,marginBottom:12}}>Conversations on modern coaching, skill acquisition, and basketball culture.</div>
            <div style={{display:"flex",gap:10}}>
              <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:6,background:"#1DB954",color:"#fff",padding:"7px 16px",borderRadius:20,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>
                Spotify
              </a>
              <a href="https://podcasts.apple.com" target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:6,background:"#A855F7",color:"#fff",padding:"7px 16px",borderRadius:20,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>
                Apple Podcasts
              </a>
            </div>
          </div>
        </div>

        {/* Prompt 7: Resources cert banner */}
        {dismissBanner&&!(dismissedBanners||[]).includes("resources-cert")&&(
          <div style={{background:`linear-gradient(135deg,${dark?"#2A2410":"#FFF8E0"},${dark?"#1E1E1E":"#FFFDF5"})`,
            border:`1px solid ${GOLD}55`,borderRadius:13,padding:"28px 24px",marginBottom:28,textAlign:"center",position:"relative"}}>
            <div className="btn" onClick={()=>dismissBanner("resources-cert")} style={{position:"absolute",top:10,right:14,fontSize:14,color:dark?GOLD+"77":"#999",cursor:"pointer"}}>×</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:GOLD,letterSpacing:2,marginBottom:10}}>JOIN THE BAM COACHES CERTIFICATION PROGRAM</div>
            <div style={{fontSize:13,color:C.textMid,marginBottom:16,lineHeight:1.5,maxWidth:480,margin:"0 auto 16px"}}>Take your coaching to the next level with structured learning, mentorship, and official certification.</div>
            <a href="https://byanymeanscoaches.com/certification" target="_blank" rel="noopener noreferrer"
              style={{display:"inline-block",padding:"10px 28px",borderRadius:8,background:GOLD,color:"#111",fontSize:14,fontWeight:800,textDecoration:"none",letterSpacing:.5}}>
              Get Certified
            </a>
          </div>
        )}

        {/* Research Papers */}
        {sectionTitle("RESEARCH PAPERS")}
        {/* Tag filter bar */}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {["All",...PAPER_TAGS].map(tag=>{
            const active = paperTag===tag;
            return (
              <button key={tag} onClick={()=>setPaperTag(tag)}
                style={{padding:"6px 16px",borderRadius:20,fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",border:`1px solid ${active?GOLD:C.border}`,background:active?(dark?"rgba(226,221,159,0.15)":"rgba(226,221,159,0.25)"):"transparent",color:active?GOLD:C.textDim,cursor:"pointer",transition:"all .2s"}}>
                {tag}
              </button>
            );
          })}
        </div>
        {/* Prompt 6: empty state for tag filter */}
        {filteredPapers.length===0?(
          <div style={{padding:"48px 0",textAlign:"center"}}>
            <img src={BAM_LOGO_PNG} alt="BAM" style={{width:48,height:48,objectFit:"contain",opacity:.35,marginBottom:16}} />
            <div style={{fontSize:15,color:C.textDim,fontWeight:500}}>No results for this category.</div>
          </div>
        ):(
        <div style={{display:"grid",gap:14}}>
          {/* Prompt 7: papers with multiple tags appear for each matching tag */}
          {filteredPapers.map(paper=>{
            const parchBg = dark ? "#2C2A22" : "#FAF6EC";
            const parchBorder = dark ? "#3D3A2E" : "#E8E0C8";
            const evidenceColors = { Strong:{bg:"#1B5E20",text:"#A5D6A7"}, Moderate:{bg:"#E65100",text:"#FFCC80"}, Preliminary:{bg:"#4A148C",text:"#CE93D8"} };
            const ev = evidenceColors[paper.strength_of_evidence] || evidenceColors.Preliminary;
            const isExpanded = expandedPaper === paper.id;
            const abstractPreview = paper.abstract.length > 180 ? paper.abstract.slice(0,180) + "…" : paper.abstract;
            const summaryText = summaries[paper.id];
            const isError = summaryText === "__error__";
            const googleSearch = `https://www.google.com/search?q=${encodeURIComponent(paper.title+" "+paper.authors)}`;
            return (
              <div key={paper.id} style={{background:parchBg,border:`1px solid ${parchBorder}`,borderRadius:14,padding:"22px 24px",position:"relative",transition:"box-shadow .2s",boxShadow:isExpanded?`0 4px 20px ${dark?"rgba(0,0,0,0.4)":"rgba(0,0,0,0.08)"}`:"none"}}>
                {/* Evidence badge */}
                <div style={{position:"absolute",top:16,right:18,background:ev.bg,color:ev.text,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:10,fontFamily:"'DM Sans',sans-serif",letterSpacing:.5,textTransform:"uppercase"}}>
                  {paper.strength_of_evidence}
                </div>
                {/* Title - serif */}
                <div style={{fontSize:17,fontWeight:700,color:dark?"#F5F0E0":"#2C2416",fontFamily:"Georgia,'Times New Roman',serif",lineHeight:1.35,marginBottom:6,paddingRight:90}}>
                  {paper.title}
                </div>
                {/* Journal & authors - small caps */}
                <div style={{fontSize:11,color:dark?"#A89F80":"#7A7058",fontVariant:"small-caps",letterSpacing:.8,marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>
                  {paper.journal} &middot; {paper.year}
                </div>
                <div style={{fontSize:11,color:dark?"#9A9278":"#8A7E64",fontVariant:"small-caps",letterSpacing:.6,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>
                  {paper.authors}
                </div>
                {/* Abstract preview */}
                <div style={{fontSize:13,color:dark?"#C8C0A8":"#5A5040",lineHeight:1.65,marginBottom:14,fontFamily:"Georgia,'Times New Roman',serif",fontStyle:"italic"}}>
                  {isExpanded ? paper.abstract : abstractPreview}
                </div>
                {/* Tags */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                  {paper.tags.map(tag=>(
                    <span key={tag} style={{fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:10,background:dark?"rgba(226,221,159,0.10)":"rgba(226,221,159,0.18)",color:GOLD,fontFamily:"'DM Sans',sans-serif",letterSpacing:.3}}>
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Actions row */}
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <button onClick={()=>{setExpandedPaper(isExpanded?null:paper.id);if(!isExpanded)generateSummary(paper);}}
                    style={{display:"inline-flex",alignItems:"center",gap:6,background:dark?"rgba(226,221,159,0.10)":"rgba(226,221,159,0.22)",color:GOLD,padding:"7px 16px",borderRadius:8,fontSize:12,fontWeight:700,border:`1px solid ${GOLD}40`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    <Sparkles size={13} />
                    {loadingSummary===paper.id?"Generating...":isExpanded?"Hide AI Summary":"Read AI Summary"}
                  </button>
                  {/* Prompt 8: DOI link with Google fallback */}
                  {paper.doi_url && !doiErr[paper.id] ? (
                    <a href={paper.doi_url} target="_blank" rel="noopener noreferrer"
                      onClick={()=>{
                        // Mark as errored if fetch fails (best-effort check)
                        fetch(paper.doi_url,{mode:"no-cors",method:"HEAD"}).catch(()=>setDoiErr(prev=>({...prev,[paper.id]:true})));
                      }}
                      style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:dark?"#A89F80":"#7A7058",textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>
                      View Paper <ExternalLink size={11} />
                    </a>
                  ) : (
                    <a href={googleSearch} target="_blank" rel="noopener noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:dark?"#A89F80":"#7A7058",textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>
                      Search this study on Google <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                {/* Expanded AI Summary — Prompt 5: cached or error fallback */}
                {isExpanded && summaryText && !isError && (
                  <div style={{marginTop:14,padding:16,background:dark?"rgba(226,221,159,0.06)":"rgba(226,221,159,0.10)",borderRadius:10,border:`1px solid ${GOLD}20`,fontSize:13,color:dark?"#E8E0C0":"#4A4230",lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif"}}>
                    <div style={{fontSize:11,fontWeight:700,color:GOLD,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>AI Summary for Coaches</div>
                    {summaryText}
                  </div>
                )}
                {isExpanded && isError && (
                  <div style={{marginTop:14,padding:16,background:dark?"rgba(226,221,159,0.06)":"rgba(226,221,159,0.10)",borderRadius:10,border:`1px solid ${GOLD}20`,fontSize:13,color:dark?"#C8C0A8":"#5A5040",lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
                    Read the study for more.
                    {paper.doi_url&&<div style={{marginTop:8}}><a href={paper.doi_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:GOLD,textDecoration:"none",fontWeight:600}}>View Paper <ExternalLink size={11} style={{verticalAlign:"middle"}} /></a></div>}
                  </div>
                )}
                {isExpanded && loadingSummary===paper.id && !summaryText && (
                  <div style={{marginTop:14,padding:16,textAlign:"center",fontSize:13,color:GOLD,fontFamily:"'DM Sans',sans-serif"}}>
                    Generating summary…
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Books */}
        {sectionTitle("RECOMMENDED BOOKS")}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14,marginBottom:40}}>
          {MOCK_BOOKS.map(book=>{
            const googleBookSearch=`https://www.google.com/search?q=${encodeURIComponent(book.title+" "+book.author)}`;
            return (
            <div key={book.id} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                {/* Prompt 8 part 3: book cover placeholder */}
                {book.coverImg && !bookImgErr[book.id] ? (
                  <img src={book.coverImg} alt={book.title}
                    onError={()=>setBookImgErr(prev=>({...prev,[book.id]:true}))}
                    style={{width:44,height:56,borderRadius:6,objectFit:"cover",flexShrink:0}} />
                ) : (
                  <div style={{width:44,height:56,borderRadius:6,background:dark?"#2A2A2A":"#E8E8E8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <BookMarked size={20} color={GOLD} />
                  </div>
                )}
                <div style={{flex:1,minWidth:0}}>
                  {/* Prompt 9: title 2-line truncation, author 1-line truncation */}
                  <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:2,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{book.title}</div>
                  <div style={{fontSize:12,color:GOLD,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{book.author}</div>
                  <div style={{fontSize:12,color:C.textDim,lineHeight:1.5,marginBottom:10}}>{book.desc}</div>
                  {/* Prompt 8 part 2: Amazon link with Google fallback */}
                  {book.url?(
                    <a href={book.url} target="_blank" rel="noopener noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:GOLD,textDecoration:"none"}}>
                      View on Amazon <ExternalLink size={11} />
                    </a>
                  ):(
                    <a href={googleBookSearch} target="_blank" rel="noopener noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:GOLD,textDecoration:"none"}}>
                      Search on Google <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ── IANA TIMEZONE LIST (common) ──────────────────────────────────────────
const IANA_TIMEZONES=["Africa/Cairo","Africa/Johannesburg","Africa/Lagos","Africa/Nairobi","America/Anchorage","America/Argentina/Buenos_Aires","America/Bogota","America/Chicago","America/Denver","America/Halifax","America/Los_Angeles","America/Mexico_City","America/New_York","America/Phoenix","America/Santiago","America/Sao_Paulo","America/St_Johns","America/Toronto","America/Vancouver","Asia/Bangkok","Asia/Colombo","Asia/Dubai","Asia/Hong_Kong","Asia/Istanbul","Asia/Jakarta","Asia/Karachi","Asia/Kolkata","Asia/Manila","Asia/Seoul","Asia/Shanghai","Asia/Singapore","Asia/Taipei","Asia/Tehran","Asia/Tokyo","Atlantic/Reykjavik","Australia/Adelaide","Australia/Brisbane","Australia/Melbourne","Australia/Perth","Australia/Sydney","Europe/Amsterdam","Europe/Athens","Europe/Berlin","Europe/Brussels","Europe/Dublin","Europe/Helsinki","Europe/Lisbon","Europe/London","Europe/Madrid","Europe/Moscow","Europe/Oslo","Europe/Paris","Europe/Prague","Europe/Rome","Europe/Stockholm","Europe/Vienna","Europe/Warsaw","Europe/Zurich","Pacific/Auckland","Pacific/Fiji","Pacific/Guam","Pacific/Honolulu"];

function getTzAbbr(tz){try{return new Intl.DateTimeFormat("en-US",{timeZone:tz,timeZoneName:"short"}).formatToParts(new Date()).find(p=>p.type==="timeZoneName")?.value||"";}catch{return "";}}

function fmtTimeInTz(date,tz){
  try{
    const d=new Date(typeof date==="number"?date:date);
    const parts=new Intl.DateTimeFormat("en-US",{timeZone:tz,hour:"numeric",minute:"2-digit",hour12:true,timeZoneName:"short"}).formatToParts(d);
    return parts.map(p=>p.value).join("");
  }catch{return "";}
}

// ── SETTINGS PAGE ──────────────────────────────────────────────────────────
function SettingsPage({C,dark,toggleDark,notifs,updateNotif,tz,updateTz,mapVisible,toggleMapVisible,dismissBanner,dismissedBanners}){
  const [tzSearch, setTzSearch] = useState("");
  const [tzOpen, setTzOpen] = useState(false);
  const [savedKey, setSavedKey] = useState(null);
  const showSaved=(key)=>{setSavedKey(key);setTimeout(()=>setSavedKey(null),1500);};

  const filteredTz=tzSearch?IANA_TIMEZONES.filter(t=>t.toLowerCase().includes(tzSearch.toLowerCase())):IANA_TIMEZONES;

  const Toggle=({checked,onChange,label,sKey,badge})=>(
    <div className="bam-settings-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",minHeight:44,borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
        <span style={{fontSize:14,color:C.text,fontWeight:500}}>{label}</span>
        {badge&&<span style={{fontSize:9,fontWeight:700,color:GOLD,background:dark?"rgba(226,221,159,0.12)":"rgba(226,221,159,0.3)",padding:"2px 8px",borderRadius:10,letterSpacing:.5}}>{badge}</span>}
        {savedKey===sKey&&<span style={{fontSize:11,color:GOLD,fontWeight:600,animation:"bamFadeOut 1.5s forwards"}}>Saved</span>}
      </div>
      <div className="ttgl" onClick={()=>{onChange(!checked);showSaved(sKey);}}
        style={{width:44,height:24,borderRadius:12,background:checked?GOLD:dark?"#444":C.border,position:"relative",flexShrink:0,cursor:"pointer"}}>
        <div className="tthm" style={{position:"absolute",top:4,left:4,width:15,height:15,borderRadius:"50%",background:checked?(dark?"#1A1A1A":"#fff"):(dark?"#666":"#fff"),transform:checked?"translateX(20px)":"translateX(0)",boxShadow:"0 1px 5px rgba(0,0,0,.3)"}}/>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,overflow:"auto",overflowX:"hidden",padding:"28px 28px 40px"}}>
      <div style={{maxWidth:600}}>
        <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:-.3,marginBottom:4}}>Settings</div>
        <div style={{fontSize:13,color:C.textDim,marginBottom:28}}>Manage your preferences</div>

        {/* Prompt 6: Upgrade banner */}
        {!dismissedBanners.includes("settings-cert")&&(
          <div style={{background:`linear-gradient(135deg,${dark?"#2A2410":"#FFF8E0"},${dark?"#1E1E1E":"#FFFDF5"})`,border:`1px solid ${GOLD}55`,borderRadius:13,padding:"20px 22px",marginBottom:28,position:"relative"}}>
            <div className="btn" onClick={()=>dismissBanner("settings-cert")} style={{position:"absolute",top:10,right:12,fontSize:14,color:C.textDim,cursor:"pointer"}}>×</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:GOLD,letterSpacing:1.5,marginBottom:6}}>ELEVATE YOUR COACHING</div>
            <div style={{fontSize:13,color:C.textMid,marginBottom:14,lineHeight:1.5}}>Get certified with the BAM Coaches Certification Program</div>
            <a href="https://byanymeanscoaches.com/certification" target="_blank" rel="noopener noreferrer"
              style={{display:"inline-block",padding:"9px 22px",borderRadius:8,background:GOLD,color:"#111",fontSize:13,fontWeight:800,textDecoration:"none",letterSpacing:.3}}>
              Get Certified
            </a>
          </div>
        )}

        {/* Appearance */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Appearance</div>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,padding:"4px 18px",boxShadow:dark?"none":`0 2px 14px ${C.shadow}`}}>
            <div className="bam-settings-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",minHeight:44}}>
              <span style={{fontSize:14,color:C.text,fontWeight:500}}>Dark Mode</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {savedKey==="dark"&&<span style={{fontSize:11,color:GOLD,fontWeight:600,animation:"bamFadeOut 1.5s forwards"}}>Saved</span>}
                <div className="ttgl" onClick={()=>{toggleDark();showSaved("dark");}}
                  style={{width:44,height:24,borderRadius:12,background:dark?GOLD:C.border,position:"relative",cursor:"pointer"}}>
                  <div className="tthm" style={{position:"absolute",top:4,left:4,width:15,height:15,borderRadius:"50%",background:dark?"#1A1A1A":"#fff",transform:dark?"translateX(20px)":"translateX(0)",boxShadow:"0 1px 5px rgba(0,0,0,.3)"}}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Notifications</div>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,padding:"4px 18px",boxShadow:dark?"none":`0 2px 14px ${C.shadow}`}}>
            <Toggle checked={notifs.inApp} onChange={v=>updateNotif("inApp",v)} label="In-app notifications" sKey="inApp"/>
            <Toggle checked={notifs.callReminder} onChange={v=>updateNotif("callReminder",v)} label="Call reminders (24h & 1h before)" sKey="callReminder"/>
            <Toggle checked={false} onChange={()=>{}} label="Email notifications" sKey="email" badge="Coming soon"/>
          </div>
        </div>

        {/* Timezone */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Timezone</div>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,padding:"14px 18px",boxShadow:dark?"none":`0 2px 14px ${C.shadow}`,position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:tzOpen?10:0}}>
              <div onClick={()=>setTzOpen(o=>!o)}
                style={{flex:1,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",minHeight:32}}>
                <div>
                  <span style={{fontSize:14,color:C.text,fontWeight:500}}>{tz}</span>
                  <span style={{fontSize:12,color:GOLD,fontWeight:600,marginLeft:8}}>{getTzAbbr(tz)}</span>
                </div>
                <ChevronDown size={14} color={C.textDim} style={{transition:"transform .2s",transform:tzOpen?"rotate(180deg)":"rotate(0)"}}/>
              </div>
              {savedKey==="tz"&&<span style={{fontSize:11,color:GOLD,fontWeight:600,animation:"bamFadeOut 1.5s forwards",flexShrink:0}}>Saved</span>}
            </div>
            {tzOpen&&(
              <div>
                <input value={tzSearch} onChange={e=>setTzSearch(e.target.value)} placeholder="Search timezones..."
                  style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,
                    background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",color:C.text,fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                <div style={{maxHeight:200,overflowY:"auto",borderRadius:8,border:`1px solid ${C.border}`}}>
                  {filteredTz.map(t=>(
                    <div key={t} onClick={()=>{updateTz(t);setTzOpen(false);setTzSearch("");showSaved("tz");}}
                      style={{padding:"10px 14px",fontSize:13,color:t===tz?GOLD:C.text,fontWeight:t===tz?700:400,
                        background:t===tz?(dark?"rgba(226,221,159,0.08)":"rgba(226,221,159,0.15)"):"transparent",
                        cursor:"pointer",borderBottom:`1px solid ${C.border}`,minHeight:44,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span>{t}</span>
                      <span style={{fontSize:11,color:C.textDim}}>{getTzAbbr(t)}</span>
                    </div>
                  ))}
                  {filteredTz.length===0&&<div style={{padding:"14px",fontSize:13,color:C.textDim,textAlign:"center"}}>No matching timezone</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Privacy</div>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,padding:"4px 18px",boxShadow:dark?"none":`0 2px 14px ${C.shadow}`}}>
            <Toggle checked={mapVisible} onChange={v=>toggleMapVisible(v)} label="Show me on the community map" sKey="map"/>
          </div>
        </div>

        {/* Billing */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Billing</div>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,padding:"18px",boxShadow:dark?"none":`0 2px 14px ${C.shadow}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>BAM Coaches Member</div>
                <div style={{fontSize:12,color:C.textDim,marginTop:2}}>Max Plan · Active</div>
              </div>
              <div style={{position:"relative"}}>
                <button disabled title="Billing portal coming soon"
                  style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",
                    color:C.textDim,fontSize:13,fontWeight:600,cursor:"not-allowed",opacity:0.5}}>
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BAMFull(){
  const [onboarded,setOnboarded]=useState(()=>{
    try{ return localStorage.getItem("onboardingComplete")==="true"; }catch(e){ return false; }
  });
  // Prompt 2: dark mode with localStorage persistence + OS default
  const [dark,setDark]=useState(()=>{
    try{
      const saved=localStorage.getItem("bam_dark_mode");
      if(saved!==null) return saved==="true";
    }catch{}
    if(typeof window!=="undefined"&&window.matchMedia) return window.matchMedia("(prefers-color-scheme:dark)").matches;
    return true;
  });
  const [tourActive,setTourActive]=useState(false);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ const t=setTimeout(()=>setLoading(false),1800); return ()=>clearTimeout(t); },[]);
  // Analytics: session tracking
  const sessionStartRef=useRef(Date.now());
  useEffect(()=>{
    logEvent("session_start",{});
    logEvent("page_view",{page:"dashboard"});
    const onUnload=()=>logEvent("session_end",{duration:Math.round((Date.now()-sessionStartRef.current)/1000)});
    window.addEventListener("beforeunload",onUnload);
    return ()=>window.removeEventListener("beforeunload",onUnload);
  },[]);
  // dashIntro = true only on very first visit this session
  const [dashIntro,setDashIntro]=useState(()=>{
    try{ return !sessionStorage.getItem("bam_dash_seen"); }catch(e){ return false; }
  });
  useEffect(()=>{
    if(dashIntro){
      try{ sessionStorage.setItem("bam_dash_seen","1"); }catch(e){}
      const t=setTimeout(()=>setDashIntro(false),2800);
      return ()=>clearTimeout(t);
    }
  },[dashIntro]);
  const [nav,setNav]=useState("dashboard");
  const [pageKey,setPageKey]=useState(0);
  const [notifOn,setNotifOn]=useState(true);
  const [notif,setNotif]=useState(null);
  const [pIdx,setPIdx]=useState(0);
  const [pVis,setPVis]=useState(true);
  const [compose,setCompose]=useState("");
  const [focused,setFocused]=useState(false);
  const [attachments,setAttachments]=useState([]);
  const [posting,setPosting]=useState(false);
  const lastPostRef=useRef({text:"",time:0});
  const attachRef=useRef(null);
  const [ptsVis,setPtsVis]=useState(false);
  const [activeTag,setActiveTag]=useState("All");
  const [profileName,setProfileName]=useState(null);
  const [favDrills,setFavDrills]=useState([]);
  const [myProfileOpen,setMyProfileOpen]=useState(false);
  const [mapOpen,setMapOpen]=useState(false);
  const [callBanner,setCallBanner]=useState(null);
  const [callsOpen,setCallsOpen]=useState(false);
  const [now,setNow]=useState(Date.now());
  const toggleFav=(item,sectionId)=>setFavDrills(prev=>{
    const key=`${sectionId}-${item.id}`;
    const removing=prev.find(f=>f.key===key);
    if(!removing) logEvent("content_save",{contentId:item.id,section:sectionId,title:item.title});
    return removing ? prev.filter(f=>f.key!==key) : [...prev,{...item,key,sectionId}];
  });
  const ptsRef=useRef(null);
  const scrollRef=useRef(null);
  const [scrollY,setScrollY]=useState(0);
  const toggleDark=()=>setDark(d=>{const n=!d;try{localStorage.setItem("bam_dark_mode",String(n));}catch{}return n;});

  // Settings state
  const [settingsNotifs, setSettingsNotifs] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("bam_settings_notifs")||'{"inApp":true,"email":false,"callReminder":true}');}catch{return{inApp:true,email:false,callReminder:true};}
  });
  const updateNotifSetting=(key,val)=>{
    setSettingsNotifs(prev=>{const n={...prev,[key]:val};try{localStorage.setItem("bam_settings_notifs",JSON.stringify(n));}catch{}return n;});
  };
  const [settingsTz, setSettingsTz] = useState(()=>{
    try{return localStorage.getItem("bam_settings_tz")||Intl.DateTimeFormat().resolvedOptions().timeZone;}catch{return "America/New_York";}
  });
  const updateTz=(tz)=>{setSettingsTz(tz);try{localStorage.setItem("bam_settings_tz",tz);}catch{}};
  const [mapVisible, setMapVisible] = useState(()=>{
    try{const v=localStorage.getItem("bam_map_visible");return v===null?true:v==="true";}catch{return true;}
  });
  const toggleMapVisible=(v)=>{setMapVisible(v);try{localStorage.setItem("bam_map_visible",String(v));}catch{}};

  // Prompt 7: upgrade banner dismissals
  const [dismissedBanners, setDismissedBanners] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("bam_dismissed_banners")||"[]");}catch{return[];}
  });
  const dismissBanner=(id)=>{setDismissedBanners(prev=>{const n=[...prev,id];try{localStorage.setItem("bam_dismissed_banners",JSON.stringify(n));}catch{}return n;});};

  // Prompt 2: Lifted profile state for app-wide propagation
  const [appProfile, setAppProfile] = useState({
    name:"Coleman Ayers", handle:"@colemanayers", role:"Head Coach / Trainer",
    org:"By Any Means Basketball", location:"Miami, FL",
    bio:"Building players from the inside out — skill, mindset, and culture. Founder of BAM Basketball.",
    ig:"byanymeans_bball", x:"colemanayers", website:"byanymeans.com",
    email:"coleman@byanymeans.com", password:"password123",
    certs:["BAM Certified Coach","Level 3 — Advanced","Max Plan Member"],
  });
  const [appPhoto, setAppPhoto] = useState(null);
  const appFirstName = appProfile.name?.split(" ")[0] || "Coach";
  const appInitials = appProfile.name?.split(" ").map(w=>w[0]||"").join("").toUpperCase()||"CA";

  // Prompt 1: greeting with user name
  const [userName, setUserName] = useState(null);
  useEffect(()=>{
    const t=setTimeout(()=>{ setUserName(appFirstName); },600);
    return ()=>clearTimeout(t);
  },[appFirstName]);
  const getGreeting=()=>{
    const h=new Date().getHours();
    if(h<12) return "Good morning";
    if(h<17) return "Good afternoon";
    return "Good evening";
  };

  // Prompt 6: announcements
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem("bam_dismissed_announcements")||"[]"); }catch{ return []; }
  });
  const dismissAnnouncement=(id)=>{
    setDismissedAnnouncements(prev=>{
      const next=[...prev,id];
      try{localStorage.setItem("bam_dismissed_announcements",JSON.stringify(next));}catch{}
      return next;
    });
  };
  const ANNOUNCEMENTS_DATA=[
    {id:"ann1",title:"BAM Coaches V2.0 is Live!",body:"New Playbook Builder, Practice Plans, and Resources — explore everything that's new.",date:"Mar 4, 2026"},
    {id:"ann2",title:"Weekly Call — Monday at 7pm ET",body:"This week: transition offense philosophy and live drill breakdowns. Bring your questions.",date:"Mar 3, 2026"},
    {id:"ann3",title:"New Masterclass Dropping Friday",body:"Full workout design masterclass with Coleman Ayers. Members get early access.",date:"Mar 1, 2026"},
  ];
  const visibleAnnouncements=ANNOUNCEMENTS_DATA.filter(a=>!dismissedAnnouncements.includes(a.id));
  const [expandedAnn, setExpandedAnn] = useState(visibleAnnouncements[0]?.id||null);

  // Prompt 5: stats loading
  const [statsLoaded, setStatsLoaded] = useState(false);
  useEffect(()=>{
    const t=setTimeout(()=>setStatsLoaded(true),1400);
    return ()=>clearTimeout(t);
  },[]);

  // Prompt 3: watched content tracking
  const [watchedIds] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem("bam_watched_ids")||"[]"); }catch{ return []; }
  });

  const C=dark?DARK:LIGHT;

  useEffect(()=>{
    if(!notifOn||!settingsNotifs.inApp) return;
    const t=setTimeout(()=>{ setNotif("New drill drop: 1v1 Live Finishing"); setTimeout(()=>setNotif(null),4000); },3000);
    return ()=>clearTimeout(t);
  },[nav,notifOn,settingsNotifs.inApp]);

  useEffect(()=>{
    const ob=new IntersectionObserver(([e])=>{ if(e.isIntersecting) setPtsVis(true); },{threshold:.3});
    if(ptsRef.current) ob.observe(ptsRef.current);
    return ()=>ob.disconnect();
  },[nav]);

  // Call notification timer
  useEffect(()=>{
    const iv=setInterval(()=>{
      const n=Date.now();
      setNow(n);
      const calls=getAllUpcomingCalls();
      const upcoming=calls.find(c=>{
        const diff=c.dateTime-n;
        return diff>0 && (diff<=86400000); // within 24h
      });
      if(upcoming){
        const diff=upcoming.dateTime-n;
        setCallBanner({...upcoming, diff});
      } else {
        setCallBanner(null);
      }
    },1000);
    return ()=>clearInterval(iv);
  },[]);

  const go=(id)=>{ if(id===nav) return; setNav(id); setPageKey(k=>k+1); setPtsVis(false); setActiveTag("All"); logEvent("page_view",{page:id}); };
  const cyclePrompt=()=>{ setPVis(false); setTimeout(()=>{ setPIdx(i=>(i+1)%PROMPTS.length); setPVis(true); },360); };

  const NAV_SECTIONS = [
    { label: null,                    items: NAV.filter(n=>n.group==="main") },
    { label: "Toolbox",               items: [], subs: [
        { id:"pd",   label:"Player Development", Icon:Target,    items: NAV.filter(n=>n.parent==="pd") },
        { id:"team", label:"Team Coaching",       Icon:Megaphone, items: NAV.filter(n=>n.parent==="team") },
      ],
      standalone: NAV.filter(n=>n.group==="lib")
    },
  ];
  const [collapsed, setCollapsed] = useState({pd:false, team:false});
  const toggleCollapse = (id) => setCollapsed(p=>({...p,[id]:!p[id]}));
  const current=NAV.find(n=>n.id===nav);
  const isContentPage = CONTENT[nav] !== undefined;

  if (loading) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#1A1A1A",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0}}>
      <img
        src="data:image/png;base64,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"
        className="micro-pulse"
        style={{width:60,height:75,objectFit:"contain",filter:"drop-shadow(0 0 18px rgba(226,221,159,0.35))"}}
      />
      <div style={{marginTop:28,fontSize:18,fontWeight:900,letterSpacing:4,color:GOLD,textTransform:"uppercase"}}>YOU'RE IN.</div>
    </div>
  );

  if(!onboarded&&!tourActive) return <OnboardingFlow onComplete={()=>setOnboarded(true)} onTourStart={()=>{setOnboarded(true);setTourActive(true);}}/>;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,height:"100vh",display:"flex",color:C.text,transition:"background .3s,color .3s",overflow:"hidden"}}>
      <style>{css}</style>

      {notif&&notifOn&&(
        <div style={{position:"fixed",top:14,left:"50%",zIndex:9999,background:SBcard,border:`1px solid ${GOLD}60`,borderRadius:9,padding:"12px 22px",fontSize:14,color:SBtext,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 28px rgba(0,0,0,0.5)",animation:"slideD .3s ease",whiteSpace:"nowrap"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:GOLD}}/>
          {notif}
          <span className="btn" onClick={()=>setNotif(null)} style={{color:SBdim,marginLeft:6,fontSize:18,lineHeight:1}}>×</span>
        </div>
      )}

      {/* Call notification banner */}
      {callBanner&&callBanner.diff<=86400000&&settingsNotifs.callReminder&&(
        <div style={{position:"fixed",top:notif&&notifOn?52:14,left:"50%",transform:"translateX(-50%)",zIndex:9998,background:"linear-gradient(135deg,#242424,#1A1A1A)",border:`1px solid ${GOLD}80`,borderRadius:10,padding:"10px 20px",fontSize:13,color:SBtext,display:"flex",alignItems:"center",gap:12,boxShadow:`0 8px 28px rgba(0,0,0,0.5),0 0 0 1px ${GOLD}20`,animation:"slideD .3s ease",whiteSpace:"nowrap"}}>
          <Video size={15} color={GOLD}/>
          <span style={{fontWeight:700,color:GOLD}}>{callBanner.title}</span>
          {callBanner.diff>0
            ?<span style={{color:SBmid}}>in {fmtCountdown(callBanner.diff)}</span>
            :<span style={{fontSize:11,fontWeight:800,color:"#fff",background:"#E06060",padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:5,animation:"livePulse 1.5s ease-in-out infinite"}}><span style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>LIVE NOW</span>
          }
          <a href={callBanner.meetLink} target="_blank" rel="noopener noreferrer"
            style={{background:GOLD,color:"#111",padding:"5px 14px",borderRadius:6,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>
            Join
          </a>
          <span className="btn" onClick={()=>setCallBanner(null)} style={{color:SBdim,fontSize:16,lineHeight:1,marginLeft:2}}>×</span>
        </div>
      )}

      {/* SIDEBAR */}
      <div style={{width:240,background:SBcard,borderRight:`1px solid ${SBborder}`,display:"flex",flexDirection:"column",flexShrink:0,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${GOLD},${GOLD}44,transparent)`}}/>
        <div style={{padding:"22px 18px 16px",borderBottom:`1px solid ${SBborder}`,display:"flex",alignItems:"center",gap:12,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,left:-8,width:120,height:80,background:GOLD,borderRadius:"50%",opacity:.06,filter:"blur(26px)",pointerEvents:"none"}}/>
          <img src="data:image/png;base64,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" alt="BAM" style={{width:27,height:34,objectFit:"contain",flexShrink:0,filter:"drop-shadow(0 1px 2px rgba(226,221,159,0.28))"}}/>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:GOLD,letterSpacing:.5,lineHeight:1.1}}>BY ANY MEANS</div>
            <div style={{fontSize:9,color:SBdim,letterSpacing:2,marginTop:3,fontWeight:600,textTransform:"uppercase"}}>Coaches Platform</div>
          </div>
        </div>
        <div style={{flex:1,padding:"10px 0",overflowY:"auto"}}>
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} style={{marginBottom:2}}>
              {/* Section label (Library) */}
              {section.label && (
                <div style={{fontSize:10,color:SBdim,letterSpacing:1.5,padding:"10px 18px 3px",fontWeight:700,textTransform:"uppercase"}}>
                  {section.label}
                </div>
              )}

              {/* Top-level items (Dashboard, Community) */}
              {section.items.map(item => {
                const active = nav===item.id;
                return (
                  <div key={item.id} className="ni" onClick={()=>go(item.id)}
                    style={{padding:"9px 18px",fontSize:13,color:active?SBtext:SBmid,fontWeight:active?700:500,
                      background:active?"rgba(226,221,159,0.1)":"transparent",
                      borderLeft:active?`3px solid ${GOLD}`:"3px solid transparent",
                      display:"flex",alignItems:"center",gap:11}}>
                    <item.Icon size={16} color={active?GOLD:GOLD+"59"} strokeWidth={active?2.2:1.8}/>
                    {item.label}
                  </div>
                );
              })}

              {/* Collapsible parent groups (Player Development, Team Coaching) */}
              {section.subs && section.subs.map(sub => {
                const isOpen = !collapsed[sub.id];
                const subActive = sub.items.some(i=>i.id===nav);
                return (
                  <div key={sub.id}>
                    {/* Parent row */}
                    <div className="ni" onClick={()=>toggleCollapse(sub.id)}
                      style={{padding:"9px 18px",fontSize:12,color:subActive?GOLD:SBmid,fontWeight:subActive?700:600,
                        display:"flex",alignItems:"center",gap:11,cursor:"pointer",userSelect:"none",
                        borderLeft:subActive?`3px solid ${GOLD}44`:"3px solid transparent"}}>
                      <sub.Icon size={15} color={subActive?GOLD:GOLD+"50"} strokeWidth={subActive?2.2:1.8}/>
                      <span style={{flex:1,textTransform:"uppercase",letterSpacing:.8,fontSize:10,fontWeight:700}}>{sub.label}</span>
                      <span style={{fontSize:10,color:SBdim,transition:"transform .2s",
                        display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>›</span>
                    </div>
                    {/* Sub-items */}
                    {isOpen && sub.items.map(item => {
                      const active = nav===item.id;
                      return (
                        <div key={item.id} className="ni" onClick={()=>go(item.id)}
                          style={{padding:"7px 18px 7px 44px",fontSize:12.5,
                            color:active?SBtext:SBmid,fontWeight:active?700:500,
                            background:active?"rgba(226,221,159,0.08)":"transparent",
                            borderLeft:active?`3px solid ${GOLD}`:"3px solid transparent",
                            display:"flex",alignItems:"center",gap:10}}>
                          <item.Icon size={14} color={active?GOLD:GOLD+"50"} strokeWidth={active?2.2:1.8}/>
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Standalone library items */}
              {section.standalone && section.standalone.map(item => {
                const active = nav===item.id;
                return (
                  <div key={item.id} className="ni" onClick={()=>go(item.id)}
                    style={{padding:"9px 18px",fontSize:13,color:active?SBtext:SBmid,fontWeight:active?700:500,
                      background:active?"rgba(226,221,159,0.1)":"transparent",
                      borderLeft:active?`3px solid ${GOLD}`:"3px solid transparent",
                      display:"flex",alignItems:"center",gap:11}}>
                    <item.Icon size={16} color={active?GOLD:GOLD+"59"} strokeWidth={active?2.2:1.8}/>
                    {item.label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="profile-row" onClick={()=>setMyProfileOpen(true)}
          style={{padding:"14px 16px",borderTop:`1px solid ${SBborder}`,display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"background .2s"}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:GOLD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#1A1A1A",flexShrink:0,position:"relative",boxShadow:`0 2px 10px ${GOLD}55`,overflow:"hidden"}}>
            {appPhoto?<img src={appPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:appInitials}
            <div style={{position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:"#5AB584",border:`2px solid ${SBcard}`}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:700,color:SBtext,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{appProfile.name}</div>
            <div style={{fontSize:11,color:SBdim}}>Admin · Max Plan</div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={SBdim} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Topbar */}
        <div style={{height:58,background:C.bgCard,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 26px",gap:14,flexShrink:0,boxShadow:dark?"none":`0 1px 8px ${C.shadow}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {current&&<current.Icon size={16} color={GOLD} strokeWidth={2}/>}
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{current?.label}</div>
          </div>
          <div style={{flex:1}}/>
          <SearchBar C={C}/>
          <div className="btn" onClick={()=>setNotifOn(n=>!n)} style={{width:36,height:36,borderRadius:9,background:notifOn?C.goldDim:C.bg,border:`1px solid ${notifOn?GOLD+"80":C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ic.Bell c={notifOn?GOLD:C.textDim} dot={notifOn}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontSize:12,color:C.textDim,fontWeight:500}}>{dark?"Dark":"Light"}</span>
            <div className="ttgl" onClick={toggleDark} style={{width:44,height:24,borderRadius:12,background:dark?GOLD:C.border,position:"relative"}}>
              <div className="tthm" style={{position:"absolute",top:4,left:4,width:15,height:15,borderRadius:"50%",background:dark?"#1A1A1A":"#fff",transform:dark?"translateX(20px)":"translateX(0)",boxShadow:"0 1px 5px rgba(0,0,0,.3)"}}/>
            </div>
          </div>
          <div className="btn" onClick={()=>setNav("settings")} style={{width:36,height:36,borderRadius:9,background:nav==="settings"?C.goldDim:C.bg,border:`1px solid ${nav==="settings"?GOLD+"80":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={nav==="settings"?GOLD:C.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div style={{fontSize:11,color:dark?GOLD:"#111",background:dark?"rgba(226,221,159,0.12)":GOLD,border:`1px solid ${dark?GOLD+"45":"transparent"}`,borderRadius:6,padding:"5px 12px",fontWeight:800,letterSpacing:.8}}>MAX PLAN</div>
        </div>

        {/* Page */}
        <div key={pageKey} className="pg" style={{flex:1,overflow:isContentPage?"hidden":"auto",display:"flex",flexDirection:"column"}}>

          {/* Content pages */}
          {isContentPage&&<ContentPage sectionId={nav} C={C} dark={dark} favDrills={favDrills} toggleFav={toggleFav}/>}

          {/* Community */}
          {nav==="community"&&(
            <div ref={scrollRef} onScroll={e=>setScrollY(e.target.scrollTop)} style={{flex:1,overflow:"auto",padding:28,position:"relative"}}>
              <Globe dark={dark}/>
              <div style={{maxWidth:720,margin:"0 auto",position:"relative",zIndex:1}}>

                <div className={focused||compose?"":"compose-pulse"} style={{background:C.bgCard,border:`1px solid ${focused?GOLD+"90":C.border}`,borderRadius:14,padding:22,marginBottom:24,transition:"border-color .25s,box-shadow .25s",boxShadow:focused?`0 0 0 4px rgba(226,221,159,0.14),0 4px 20px ${C.shadow}`:dark?"none":`0 2px 12px ${C.shadow}`}}>
                  <input ref={attachRef} type="file" multiple accept="image/*,video/*,.pdf" style={{display:"none"}} onChange={e=>{
                    const files=Array.from(e.target.files||[]);
                    files.slice(0,3-attachments.length).forEach(file=>{
                      setAttachments(a=>[...a,{url:URL.createObjectURL(file),type:file.type,name:file.name}]);
                    });
                    e.target.value="";
                  }}/>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:GOLD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#1A1A1A",flexShrink:0,boxShadow:`0 2px 10px ${GOLD}55`}}>CA</div>
                    <div style={{flex:1}}>
                      <textarea value={compose} onChange={e=>setCompose(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>!compose&&!attachments.length&&setFocused(false)} placeholder="Share something with the community..."
                        style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:15,color:C.text,resize:"none",fontFamily:"'DM Sans',sans-serif",lineHeight:1.65,minHeight:focused?86:32,transition:"min-height .22s",caretColor:GOLD}}/>
                      {!compose&&attachments.length===0&&(<div style={{display:"flex",alignItems:"center",gap:9,paddingTop:11,borderTop:`1px solid ${C.border}`,opacity:pVis?1:0,transition:"opacity .36s"}}>
                        <div style={{width:20,height:20,borderRadius:6,background:C.goldDim,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M4 1v6M1 4h6" stroke={dark?GOLD:"#555"} strokeWidth="1.5" strokeLinecap="round"/></svg></div>
                        <div style={{fontSize:13,color:C.textDim,fontStyle:"italic",flex:1}}>{PROMPTS[pIdx]}</div>
                        <span className="btn" onClick={cyclePrompt} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:dark?GOLD:"#555",fontWeight:700}}><Ic.Spin c={dark?GOLD:"#555"} s={12}/> Next</span>
                      </div>)}
                      {attachments.length>0&&(
                        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                          {attachments.map((a,idx)=>{
                            const isImg=a.type.startsWith("image/");
                            const isVid=a.type.startsWith("video/");
                            return(
                              <div key={idx} style={{position:"relative",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`,flexShrink:0}}>
                                {isImg&&<img src={a.url} style={{width:90,height:72,objectFit:"cover",display:"block"}}/>}
                                {isVid&&<div style={{width:110,height:72,background:"#111",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                                  <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill={GOLD} opacity=".15" stroke={GOLD} strokeWidth="1"/><path d="M7 6.5l5 2.5-5 2.5V6.5z" fill={GOLD}/></svg>
                                  <span style={{fontSize:9,color:"#888",maxWidth:98,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 6px"}}>{a.name}</span>
                                </div>}
                                {!isImg&&!isVid&&<div style={{width:110,height:72,background:dark?"#2A1A10":"#FFF5F0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                                  <span style={{fontSize:20}}>📄</span>
                                  <span style={{fontSize:9,color:"#888",maxWidth:98,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 6px"}}>{a.name}</span>
                                </div>}
                                <div className="btn" onClick={()=>setAttachments(p=>p.filter((_,j)=>j!==idx))} style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <X size={9} color="#fff"/>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {focused&&(
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:14}}>
                          {attachments.length<3&&(
                            <div className="btn" onClick={()=>attachRef.current.click()} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:C.textDim,padding:"6px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bgHover}}>
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke={C.textDim} strokeWidth="1.6" strokeLinecap="round"/></svg>
                              {attachments.length>0?`Add more (${attachments.length}/3)`:"Photo · Video · PDF"}
                            </div>
                          )}
                          <div style={{flex:1}}/>
                          <div className="btn" onClick={()=>{setFocused(false);setCompose("");setAttachments([]);}} style={{fontSize:14,color:C.textMid,padding:"8px 18px",borderRadius:8,border:`1px solid ${C.border}`}}>Cancel</div>
                          <div className="btn" onClick={()=>{
                            if(posting||(!compose.trim()&&!attachments.length)) return;
                            const now=Date.now();
                            if(compose.trim()===lastPostRef.current.text&&now-lastPostRef.current.time<30000) return;
                            setPosting(true);
                            lastPostRef.current={text:compose.trim(),time:now};
                            setTimeout(()=>{setPosting(false);setFocused(false);setCompose("");setAttachments([]);},400);
                          }} style={{fontSize:14,color:"#1A1A1A",background:GOLD,padding:"8px 20px",borderRadius:8,fontWeight:800,boxShadow:`0 4px 14px ${GOLD}55`,opacity:(compose.trim()||attachments.length)&&!posting?1:0.5,pointerEvents:posting||(!compose.trim()&&!attachments.length)?"none":"auto"}}>
                            {posting?"Posting...":"Post"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22,flexWrap:"wrap"}}>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",flex:1}}>
                    {ALL_TAGS_COMM.map(tag=>(<div key={tag} className="tag-pill" onClick={()=>setActiveTag(tag)} style={{fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:20,border:`1px solid ${activeTag===tag?GOLD:C.border}`,background:activeTag===tag?GOLD:"transparent",color:activeTag===tag?"#111":C.textMid}}>{tag}</div>))}
                  </div>
                  <div className="btn" onClick={()=>setMapOpen(true)}
                    style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:20,
                      border:`1px solid ${GOLD}55`,background:dark?"rgba(226,221,159,0.08)":"rgba(226,221,159,0.15)",
                      cursor:"pointer",flexShrink:0,transition:"all .2s"}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 0 0-8-8z"/>
                    </svg>
                    <span style={{fontSize:12,fontWeight:700,color:GOLD,letterSpacing:.4}}>Member Map</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}>
                  <span style={{fontSize:18}}>🔥</span>
                  <span style={{fontSize:18,fontWeight:800,color:C.text,letterSpacing:.5,textTransform:"uppercase"}}>Trending</span>
                  <div style={{flex:1,height:1,background:C.border}}/>
                  <span style={{fontSize:12,color:C.textDim}}>Most active this week</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:28}}>
                  {TRENDING_POSTS.slice(0,2).map((p,idx)=>{
                    const ac=getAC(p.author); const border=getCardBorder(p.id);
                    return (
                      <div key={p.id} className="tc" style={{background:C.bgCard,border:`1px solid ${C.border}`,borderTop:`3px solid ${border}`,borderRadius:11,padding:17,boxShadow:dark?"none":`0 2px 10px ${C.shadow}`,position:"relative"}}>
                        <div style={{position:"absolute",top:11,right:13,display:"flex",alignItems:"center",gap:4}}><Ic.Trophy c={dark?GOLD:"#555"} s={12}/><span style={{fontSize:12,fontWeight:700,color:dark?GOLD:"#555"}}>#{idx+1}</span></div>
                        <div style={{display:"flex",gap:10,marginBottom:11}}>
                          <div style={{width:32,height:32,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",boxShadow:`0 2px 6px ${ac}55`}}>{MEMBERS[p.author]?.initials}</div>
                          <div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{p.author}</div><div style={{fontSize:11,color:C.textDim}}>{MEMBERS[p.author]?.loc} · {p.time}</div></div>
                        </div>
                        <div style={{fontSize:13,color:C.textMid,lineHeight:1.65,marginBottom:12}}>{p.content.slice(0,90)}...</div>
                        <div style={{display:"flex",gap:12,alignItems:"center"}}>
                          <span style={{fontSize:12,color:dark?GOLD:"#111",display:"flex",alignItems:"center",gap:5,fontWeight:700}}><Ic.Heart c={dark?GOLD:"#111"} s={13} f/>{p.likes}</span>
                          <span style={{fontSize:12,color:C.textDim,display:"flex",alignItems:"center",gap:5}}><Ic.Msg c={C.textDim} s={12}/>{p.replies.length}</span>
                          <div style={{marginLeft:"auto",fontSize:10,fontWeight:700,color:"#111",background:GOLD,padding:"3px 9px",borderRadius:12}}>{p.tag}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Group Calls Widget ── */}
                {(()=>{
                  const calls=getAllUpcomingCalls();
                  const next=calls[0];
                  if(!next) return null;
                  const nextDate=new Date(next.dateTime);
                  const diff=next.dateTime-now;
                  const calMonth=nextDate.getMonth();
                  const calYear=nextDate.getFullYear();
                  const firstDay=new Date(calYear,calMonth,1).getDay();
                  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
                  const callDays=new Set(calls.filter(c=>{const d=new Date(c.dateTime);return d.getMonth()===calMonth&&d.getFullYear()===calYear;}).map(c=>new Date(c.dateTime).getDate()));
                  const today=new Date();
                  const todayDate=today.getMonth()===calMonth&&today.getFullYear()===calYear?today.getDate():-1;
                  return (
                    <div style={{marginBottom:20}}>
                      {/* Collapsed row */}
                      <div onClick={()=>setCallsOpen(o=>!o)} style={{background:C.bgCard,border:`1px solid ${callsOpen?GOLD+"50":C.border}`,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"border-color .2s"}}>
                        <CalendarDays size={14} color={GOLD}/>
                        <span style={{fontSize:13,fontWeight:600,color:C.text,flex:1}}>Next Call: Monday {fmtTimeInTz(next.dateTime,settingsTz)}</span>
                        {diff>0
                          ?<span style={{fontSize:12,color:GOLD,fontWeight:700}}>{fmtCountdown(diff)}</span>
                          :<span style={{fontSize:11,fontWeight:800,color:"#fff",background:"#E06060",padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:5,animation:"livePulse 1.5s ease-in-out infinite"}}>
                            <span style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>LIVE NOW
                          </span>
                        }
                        <ChevronDown size={14} color={C.textDim} style={{transform:callsOpen?"rotate(180deg)":"none",transition:"transform .2s"}}/>
                      </div>
                      {/* Expanded panel */}
                      {callsOpen&&(
                        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:16,marginTop:-1}}>
                          {/* Next call details + Join */}
                          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:"10px 14px",background:`${GOLD}0A`,borderRadius:8,border:`1px solid ${GOLD}20`}}>
                            <Video size={16} color={GOLD}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{next.title}</div>
                              <div style={{fontSize:11,color:C.textDim}}>
                                {nextDate.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})} at {nextDate.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})} EST
                              </div>
                            </div>
                            <a href={next.meetLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                              style={{display:"inline-flex",alignItems:"center",gap:5,background:GOLD,color:"#111",padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
                              Join <Video size={11}/>
                            </a>
                          </div>
                          {/* Mini calendar */}
                          <div style={{fontSize:11,fontWeight:700,color:C.textDim,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                            <CalendarDays size={11} color={C.textDim}/>
                            {new Date(calYear,calMonth).toLocaleDateString("en-US",{month:"long",year:"numeric"})}
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,textAlign:"center"}}>
                            {["S","M","T","W","T","F","S"].map((d,i)=>(
                              <div key={i} style={{fontSize:9,color:C.textDim,fontWeight:700,padding:2}}>{d}</div>
                            ))}
                            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                            {Array.from({length:daysInMonth}).map((_,i)=>{
                              const day=i+1;
                              const hasCall=callDays.has(day);
                              const isToday=day===todayDate;
                              return (
                                <div key={day} style={{padding:"4px 0",fontSize:11,borderRadius:6,fontWeight:hasCall||isToday?700:400,
                                  color:hasCall?"#111":isToday?GOLD:C.textMid,
                                  background:hasCall?GOLD:isToday?`${GOLD}18`:"transparent"}}>
                                  {day}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}>
                  <span style={{fontSize:18}}>📌</span>
                  <span style={{fontSize:18,fontWeight:800,color:C.text,letterSpacing:.5,textTransform:"uppercase"}}>New Posts</span>
                  <div style={{flex:1,height:1,background:C.border}}/>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill={C.green} opacity=".3"/><circle cx="4" cy="4" r="1.8" fill={C.green}/></svg>
                    <span style={{fontSize:12,color:C.green,fontWeight:700}}>Live</span>
                  </div>
                </div>
                {(activeTag==="All"?POSTS_DATA:POSTS_DATA.filter(p=>p.tag===activeTag)).map((p,i)=><PostCard key={p.id} p={p} C={C} dark={dark} onTagClick={t=>setActiveTag(t)} activeTag={activeTag==="All"?null:activeTag} onProfileClick={setProfileName} showLikeHint={i===0} onDelete={(id)=>{const idx=POSTS_DATA.findIndex(x=>x.id===id);if(idx>-1)POSTS_DATA.splice(idx,1);}}/>)}
              </div>
            </div>
          )}

          {/* Dashboard */}
          {nav==="dashboard"&&(
            <div style={{flex:1,overflow:"auto",overflowX:"hidden",padding:"28px 28px 40px",position:"relative"}}>
              {dashIntro&&<DashIntro dark={dark}/>}

              {/* Greeting */}
              <div className={dashIntro?"dash-intro-item":""} style={{marginBottom:8,animationDelay:"0.45s"}}>
                {userName===null?(
                  <div style={{height:32,display:"flex",alignItems:"center",gap:8}}>
                    <svg width="32" height="32" viewBox="0 0 32 32" style={{opacity:0.7}}>
                      <style>{`@keyframes dnaL{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}@keyframes dnaR{0%{transform:translateY(0)}50%{transform:translateY(6px)}100%{transform:translateY(0)}}`}</style>
                      {[0,1,2,3,4].map(i=>(
                        <g key={i}>
                          <circle cx={4+i*6} cy={16} r="2" fill={GOLD} style={{animation:`dnaL 1.2s ease-in-out ${i*0.15}s infinite`}}/>
                          <circle cx={4+i*6} cy={16} r="2" fill={GOLD} opacity=".4" style={{animation:`dnaR 1.2s ease-in-out ${i*0.15}s infinite`}}/>
                          <line x1={4+i*6} y1={10} x2={4+i*6} y2={22} stroke={GOLD} strokeWidth=".5" opacity=".25" style={{animation:`dnaL 1.2s ease-in-out ${i*0.15}s infinite`}}/>
                        </g>
                      ))}
                    </svg>
                  </div>
                ):(
                  <div style={{fontSize:16,fontWeight:600,color:C.textMid,letterSpacing:.2}}>{getGreeting()}, {userName}.</div>
                )}
              </div>

              {/* Prompt 7: Upgrade banner on dashboard */}
              {!dismissedBanners.includes("dash-cert")&&(
                <div className={dashIntro?"dash-intro-item":""} style={{marginBottom:16,animationDelay:"0.48s",
                  background:`linear-gradient(135deg,${dark?"#2A2410":"#FFF8E0"},${dark?"#1E1E1E":"#FFFDF5"})`,
                  border:`1px solid ${GOLD}55`,borderRadius:13,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",position:"relative"}}>
                  <div style={{flex:1,minWidth:200}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.text}}>Ready to level up? </span>
                    <span style={{fontSize:14,color:C.textMid}}>Get BAM Certified.</span>
                  </div>
                  <a href="https://byanymeanscoaches.com/certification" target="_blank" rel="noopener noreferrer"
                    style={{padding:"8px 18px",borderRadius:8,background:GOLD,color:"#111",fontSize:12,fontWeight:800,textDecoration:"none",flexShrink:0}}>
                    Learn More
                  </a>
                  <div className="btn" onClick={()=>dismissBanner("dash-cert")} style={{position:"absolute",top:8,right:12,fontSize:14,color:C.textDim,cursor:"pointer"}}>×</div>
                </div>
              )}

              {/* HOW DO YOU WANT TO GET BETTER TODAY */}
              <div className={dashIntro?"dash-intro-item":""} style={{marginBottom:32,animationDelay:"0.55s"}}>
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:-.5,marginBottom:6,lineHeight:1.15}}>How do you want to get better today?</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:14,color:C.textDim,fontWeight:500}}>Pick a path and dive in.</div>
                    <div style={{display:"flex",gap:4}}>
                      {[0,1,2].map(i=>(<div key={i} style={{width:6,height:6,borderRight:`2px solid ${GOLD}`,borderBottom:`2px solid ${GOLD}`,transform:"rotate(-45deg)",opacity:0,animation:`arrowFade 1.4s ease-in-out ${i*0.22}s infinite`}}/>))}
                    </div>
                  </div>
                </div>
                <div className="bam-dash-cards" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                  {[
                    {img:"data:image/jpeg;base64,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",num:1,label1:"Improve My",label2:"Team Coaching",sub:"X&O, practice design, systems",dest:"team"},
                    {img:"data:image/jpeg;base64,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",num:2,label1:"Player Dev",label2:"Rabbithole",sub:"Drills, workouts, insights",dest:"pd"},
                    {img:"data:image/jpeg;base64,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",num:3,label1:"Check New",label2:"Messages",sub:"Community & recent posts",dest:"community"},
                    {img:"data:image/jpeg;base64,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",num:4,label1:"Build a Workout",label2:"or Practice",sub:"Practice builder & plans",dest:"plans"}
                  ].map((card,ci)=>(
                    <div key={ci} className="btn navCard" onClick={()=>go(card.dest)}
                      style={{position:"relative",borderRadius:14,overflow:"hidden",aspectRatio:"3/4",
                        cursor:"pointer",
                        animation:`cardRadiate 6s ease-in-out ${ci*1.5}s infinite`,
                        boxShadow:dark?"0 8px 32px rgba(0,0,0,0.5)":"0 4px 20px rgba(0,0,0,0.18)"}}>
                      <img src={card.img} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 20%",transform:"scale(1.12)",transformOrigin:"center 30%",filter:"brightness(0.48) saturate(0.8)"}}/>
                      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.55) 100%)"}}/>
                      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 14px",textAlign:"center"}}>
                        <div style={{fontSize:17,fontWeight:900,color:"#fff",lineHeight:1.2,letterSpacing:1.5,textShadow:"0 2px 12px rgba(0,0,0,0.6)",marginBottom:7,textTransform:"uppercase"}}><div>{card.label1}</div><div>{card.label2}</div></div>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:500,letterSpacing:.3,textShadow:"0 1px 6px rgba(0,0,0,0.5)"}}>{card.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompt 6: Announcements — hidden if none */}
              {visibleAnnouncements.length>0&&(
                <div className={dashIntro?"dash-intro-item":""}  style={{marginBottom:28,animationDelay:"0.62s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                    <span style={{fontSize:16}}>📢</span>
                    <span style={{fontSize:13,fontWeight:800,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>Announcements</span>
                    <div style={{flex:1,height:1,background:C.border}}/>
                  </div>
                  <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden",boxShadow:dark?"none":`0 2px 14px ${C.shadow}`}}>
                    {visibleAnnouncements.map((a,i)=>{
                      const isOpen=expandedAnn===a.id;
                      return (
                        <div key={a.id} style={{borderBottom:i<visibleAnnouncements.length-1?`1px solid ${C.border}`:"none"}}>
                          <div onClick={()=>setExpandedAnn(isOpen?null:a.id)}
                            style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",cursor:"pointer",minHeight:44}}>
                            <div style={{flex:1,fontSize:14,fontWeight:700,color:C.text}}>{a.title}</div>
                            <span style={{fontSize:11,color:C.textDim,flexShrink:0}}>{a.date}</span>
                            <ChevronDown size={14} color={C.textDim} style={{transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0)"}}/>
                          </div>
                          {isOpen&&(
                            <div style={{padding:"0 18px 14px",display:"flex",alignItems:"flex-start",gap:12}}>
                              <div style={{flex:1,fontSize:13,color:C.textMid,lineHeight:1.6}}>{a.body}</div>
                              <button onClick={(e)=>{e.stopPropagation();dismissAnnouncement(a.id);}}
                                style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",
                                  color:C.textDim,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,minHeight:44,display:"flex",alignItems:"center"}}>
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Prompt 3: Continue Watching / Start Watching */}
              <div className={dashIntro?"dash-intro-item":""} style={{marginBottom:28,animationDelay:"0.68s"}}>
                {(()=>{
                  const hasWatched=watchedIds.length>0;
                  const watchItems=hasWatched
                    ? ALL_CONTENT_ITEMS.filter(c=>watchedIds.includes(`${c.sectionId}-${c.id}`)).slice(0,4)
                    : ALL_CONTENT_ITEMS.slice(0,4);
                  const items=watchItems.length>0?watchItems:ALL_CONTENT_ITEMS.slice(0,4);
                  return (<>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                      <Play size={16} color={GOLD} fill={GOLD}/>
                      <span style={{fontSize:13,fontWeight:800,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>{hasWatched?"Continue Where You Left Off":"Start Watching"}</span>
                      <div style={{flex:1,height:1,background:C.border}}/>
                    </div>
                    <div className="bam-dash-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                      {items.map(item=>{
                        const tc=(SECTION_COLORS[item.sectionId]||SECTION_COLORS.pd)[item.id%8];
                        return (
                          <div key={`${item.sectionId}-${item.id}`} onClick={()=>setNav(item.sectionId)}
                            style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",minHeight:44}}>
                            <div style={{height:70,background:tc,display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <Play size={16} color="#fff" fill="#fff"/>
                            </div>
                            <div style={{padding:"10px 12px"}}>
                              <div style={{fontSize:9,fontWeight:700,color:"#111",background:GOLD,padding:"2px 7px",borderRadius:8,display:"inline-block",marginBottom:5,letterSpacing:.5}}>{item.tag||item.sub}</div>
                              <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                              <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{item.duration}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>);
                })()}
              </div>

              {/* Prompt 2: New This Week — falls back to most recent content */}
              <div className={dashIntro?"dash-intro-item":""} style={{marginBottom:28,animationDelay:"0.74s"}}>
                {(()=>{
                  const newItems=ALL_CONTENT_ITEMS.filter(i=>i.isNew);
                  const items=newItems.length>0?newItems.slice(0,4):ALL_CONTENT_ITEMS.slice(0,4);
                  return (<>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                      <span style={{fontSize:16}}>⚡</span>
                      <span style={{fontSize:13,fontWeight:800,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>New This Week</span>
                      <div style={{flex:1,height:1,background:C.border}}/>
                    </div>
                    <div className="bam-dash-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                      {items.map(item=>{
                        const tc=(SECTION_COLORS[item.sectionId]||SECTION_COLORS.pd)[item.id%8];
                        return (
                          <div key={`ntw-${item.sectionId}-${item.id}`} onClick={()=>setNav(item.sectionId)}
                            style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",minHeight:44}}>
                            <div style={{height:60,background:tc,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                              <Play size={14} color="#fff" fill="#fff"/>
                              {item.isNew&&<div style={{position:"absolute",top:6,right:7,fontSize:8,fontWeight:800,color:"#111",background:GOLD,padding:"2px 6px",borderRadius:4,letterSpacing:.6}}>NEW</div>}
                            </div>
                            <div style={{padding:"9px 12px"}}>
                              <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                              <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{item.duration}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>);
                })()}
              </div>

              {/* Prompt 2: Trending — falls back to random content */}
              <div className={dashIntro?"dash-intro-item":""} style={{marginBottom:28,animationDelay:"0.80s"}}>
                {(()=>{
                  const items=TRENDING_POSTS.slice(0,2);
                  return (<>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                      <span style={{fontSize:16}}>🔥</span>
                      <span style={{fontSize:13,fontWeight:800,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>Trending</span>
                      <div style={{flex:1,height:1,background:C.border}}/>
                      <span style={{fontSize:12,color:C.textDim}}>Most active this week</span>
                    </div>
                    <div className="bam-dash-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:13}}>
                      {items.map((p,idx)=>{
                        const ac=getAC(p.author);
                        return (
                          <div key={p.id} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderTop:`3px solid ${ac}`,
                            borderRadius:11,padding:17,boxShadow:dark?"none":`0 2px 10px ${C.shadow}`,minHeight:44}}>
                            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                              <div style={{width:28,height:28,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",
                                fontSize:9,fontWeight:800,color:"#fff",flexShrink:0}}>
                                {p.author.split(" ").map(w=>w[0]).join("")}
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div>
                                <div style={{fontSize:11,color:C.textDim}}>{p.author} · {p.time}</div>
                              </div>
                              <div style={{display:"flex",alignItems:"center",gap:3}}>
                                <span style={{fontSize:11,color:C.textDim}}>♥ {p.likes}</span>
                              </div>
                            </div>
                            <div style={{fontSize:12,color:C.textMid,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.content}</div>
                          </div>
                        );
                      })}
                    </div>
                  </>);
                })()}
              </div>

              {/* Bottom grid */}
              <div className={`bam-dash-bottom ${dashIntro?"dash-intro-item":""}`} style={{display:"grid",gridTemplateColumns:"1fr 302px",gap:24,animationDelay:"0.9s"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,marginBottom:14,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>Recent Community Posts</div>
                  {POSTS_DATA.slice(0,3).map(p=><PostCard key={p.id} p={p} C={C} dark={dark} compact onProfileClick={setProfileName}/>)}
                </div>
                <div>
                  <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,padding:20,marginBottom:16,boxShadow:dark?"none":`0 2px 14px ${C.shadow}`}}>
                    <div style={{fontSize:13,fontWeight:800,marginBottom:16,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>👤 Your Stats</div>
                    {[["Posts","24"],["Practice Plans Made","7"],["Comments Left","61"],["Time on Platform","14h"],["Day Streak","12"]].map(([l,v],i,a)=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",minHeight:44,borderBottom:i<a.length-1?`1px solid ${C.border}`:"none"}}>
                        <span style={{fontSize:14,color:C.textMid}}>{l}</span>
                        {statsLoaded?(
                          <span style={{fontSize:24,fontWeight:800,color:dark?GOLD:"#111"}}>{v||"0"}</span>
                        ):(
                          <div style={{width:40,height:24,borderRadius:6,background:dark?"#333":"#e8e8e8",overflow:"hidden",position:"relative"}}>
                            <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)"},transparent)`,animation:"bamShimmer 1.5s ease-in-out infinite"}}/>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,padding:20,marginBottom:16,boxShadow:dark?"none":`0 2px 14px ${C.shadow}`}}>
                    <div style={{fontSize:13,fontWeight:800,marginBottom:16,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>⚡ This Week's Drops</div>
                    {[{t:"1v1 Live Finishing",ty:"Drill",c:"#3D6B5E"},{t:"Session Design Vol.3",ty:"Insight",c:"#3D506B"},{t:"Spain Pick & Roll",ty:"X&O",c:"#5E3D6B"},{t:"Full Shooting Workout",ty:"Workout",c:"#6B5E3D"}].map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}><div style={{width:38,height:38,borderRadius:9,background:item.c,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.t}</div><div style={{fontSize:12,color:C.textDim}}>{item.ty}</div></div><div style={{fontSize:9,fontWeight:800,color:"#1A1A1A",background:GOLD,padding:"3px 8px",borderRadius:4,letterSpacing:.8}}>NEW</div></div>))}
                  </div>
                  <div ref={ptsRef} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:13,padding:20,boxShadow:dark?"none":`0 2px 14px ${C.shadow}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><span style={{fontSize:16}}>🏆</span><div style={{fontSize:13,fontWeight:800,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>Leaderboard</div></div>
                    {LEADERBOARD.map((c,i)=>{ const ac=getAC(c.n); return (<div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}><div style={{fontSize:13,color:i===0?GOLD:C.textDim,width:16,textAlign:"center",fontWeight:800}}>{i===0?"★":i+1}</div><div style={{width:30,height:30,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",boxShadow:`0 2px 6px ${ac}55`}}>{c.i}</div><div style={{flex:1,fontSize:14,fontWeight:600,color:C.text,cursor:"pointer"}} onClick={()=>setProfileName(c.n)}>{c.n}</div><div className={ptsVis?"pts":""} style={{fontSize:14,color:dark?GOLD:"#111",fontWeight:800,opacity:ptsVis?1:0}}>{c.pts} pts</div></div>); })}
                  </div>
                </div>
              </div>

              {/* ── Favorite Drills ─────────────────────────────────── */}
              <div className={dashIntro?"dash-intro-item":""} style={{marginTop:24,animationDelay:"1.25s"}}>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={GOLD} stroke={GOLD} strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <div style={{fontSize:13,fontWeight:800,color:C.textDim,letterSpacing:.8,textTransform:"uppercase"}}>Favorite Drills</div>
                </div>
                {favDrills.length===0?(
                  <div style={{background:C.bgCard,border:`1px dashed ${C.border}`,borderRadius:13,padding:"28px 20px",textAlign:"center"}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD+"55"} strokeWidth="1.5" style={{marginBottom:10,display:"block",margin:"0 auto 10px"}}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <div style={{fontSize:13,color:C.textDim,fontWeight:500}}>No favorites yet — tap the ♥ on any drill to save it here.</div>
                  </div>
                ):(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                    {favDrills.map(item=>{
                      const thumbColors = SECTION_COLORS[item.sectionId]||SECTION_COLORS.pd;
                      const tc = thumbColors[item.id % thumbColors.length];
                      return (
                        <div key={item.key} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",position:"relative"}}>
                          <div style={{height:80,background:tc,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                            <Play size={16} color="#fff" fill="#fff"/>
                            <div onClick={()=>setFavDrills(p=>p.filter(f=>f.key!==item.key))}
                              style={{position:"absolute",top:6,right:7,width:24,height:24,borderRadius:"50%",
                                background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
                              className="btn">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill={GOLD} stroke={GOLD} strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                            </div>
                          </div>
                          <div style={{padding:"10px 12px"}}>
                            <div style={{fontSize:9,fontWeight:700,color:"#111",background:GOLD,padding:"2px 7px",borderRadius:8,display:"inline-block",marginBottom:5,letterSpacing:.5}}>{item.tag}</div>
                            <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.3}}>{item.title}</div>
                            <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{item.duration}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resources */}
          {nav==="resources"&&(
            <ResourcesPage C={C} dark={dark} dismissedBanners={dismissedBanners} dismissBanner={dismissBanner}/>
          )}

          {/* Playbook Builder */}
          {nav==="playbook"&&(
            <PlaybookBuilder C={C} dark={dark}/>
          )}

          {/* Settings */}
          {nav==="settings"&&(
            <SettingsPage C={C} dark={dark} toggleDark={toggleDark}
              notifs={settingsNotifs} updateNotif={updateNotifSetting}
              tz={settingsTz} updateTz={updateTz}
              mapVisible={mapVisible} toggleMapVisible={toggleMapVisible}
              dismissBanner={dismissBanner} dismissedBanners={dismissedBanners}/>
          )}

          {/* 404 fallback for unmatched nav */}
          {!isContentPage&&nav!=="dashboard"&&nav!=="community"&&nav!=="resources"&&nav!=="playbook"&&nav!=="settings"&&(
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:40,textAlign:"center"}}>
              <img src={BAM_LOGO_PNG} alt="BAM" style={{width:56,height:56,objectFit:"contain",marginBottom:24,opacity:.6}} />
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:72,color:GOLD,letterSpacing:4,lineHeight:1}}>404</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.text,letterSpacing:3,marginTop:8}}>PAGE NOT FOUND</div>
              <div style={{fontSize:14,color:C.textDim,marginTop:12,maxWidth:340,lineHeight:1.6}}>Looks like this play didn't draw up right.</div>
              <button onClick={()=>setNav("dashboard")}
                style={{marginTop:24,padding:"10px 28px",borderRadius:8,fontSize:14,fontWeight:800,background:GOLD,color:"#111",border:"none",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
                Go Back
              </button>
            </div>
          )}
        </div>
      {profileName&&<ProfilePanel key={profileName} name={profileName} dark={dark} C={C} onClose={()=>setProfileName(null)}/>}
      {myProfileOpen&&<MyProfilePanel C={C} dark={dark} onClose={()=>setMyProfileOpen(false)}
        profile={appProfile} onProfileUpdate={setAppProfile} photo={appPhoto} onPhotoUpdate={setAppPhoto}
        dismissedBanners={dismissedBanners} dismissBanner={dismissBanner}/>}
      {mapOpen&&<MemberMapOverlay C={C} dark={dark} onClose={()=>setMapOpen(false)} onProfileClick={(name)=>{setProfileName(name);setMapOpen(false);}}/>}
      {tourActive&&<TourOverlay onComplete={()=>setTourActive(false)} onNavigate={setNav}/>}
      </div>
    </div>
  );
}
