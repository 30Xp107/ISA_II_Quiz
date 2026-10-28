import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Copy,
  Crown,
  ChevronDown,
  ChevronUp,
  CirclePlus,
  Download,
  ExternalLink,
  LoaderCircle,
  Monitor,
  Music,
  Play,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Save,
  Trash2,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Participant = {
  id?: string;
  nickname: string;
  avatar: string;
  scores?: number[];
  correctByStage?: number[];
  responseTimeByStage?: number[];
  total?: number;
  correctTotal?: number;
  responseTimeTotal?: number;
};
type Question = {
  prompt: string;
  options: string[];
  answer?: number;
  explanation?: string;
  deadline: number;
};
type EditableQuestion = Omit<Question, "deadline"> & { answer: number };
type ChallengeRow = {
  id: string;
  hhid: string;
  wgp: string;
  name: string;
  birthday: string;
  ebt: string;
  pk: string;
  municipality: string;
  issue?: string;
  note?: string;
};
type Session = {
  code: string;
  status: string;
  stage: number;
  stageTitle: string;
  questionIndex: number;
  questionCount: number;
  durationSeconds: number;
  question: Question | null;
  participants: Participant[];
  responseCount: number;
  ownResult?: {
    correct: boolean;
    correctCount: number;
    totalChecks: number;
    points: number;
  } | null;
  challengeRows?: ChallengeRow[];
};

function compareStage(a: Participant, b: Participant, stageIndex: number) {
  return (
    (b.scores?.[stageIndex] || 0) - (a.scores?.[stageIndex] || 0) ||
    (b.correctByStage?.[stageIndex] || 0) - (a.correctByStage?.[stageIndex] || 0) ||
    (a.responseTimeByStage?.[stageIndex] || 0) - (b.responseTimeByStage?.[stageIndex] || 0) ||
    a.nickname.localeCompare(b.nickname)
  );
}

function compareTotal(a: Participant, b: Participant) {
  return (
    (b.total || 0) - (a.total || 0) ||
    (b.correctTotal || 0) - (a.correctTotal || 0) ||
    (a.responseTimeTotal || 0) - (b.responseTimeTotal || 0) ||
    a.nickname.localeCompare(b.nickname)
  );
}

const avatars = [
  "person-1",
  "person-2",
  "person-3",
  "person-4",
  "person-5",
  "person-6",
  "person-7",
  "person-8",
];

const avatarLooks = [
  { skin: "#d99a70", hair: "#30231f", shirt: "#50bfa8", style: "short" },
  { skin: "#f0c19b", hair: "#58372b", shirt: "#f07d78", style: "long" },
  { skin: "#8d553e", hair: "#211b1b", shirt: "#8c7be8", style: "curls" },
  { skin: "#e8b58a", hair: "#bd6037", shirt: "#e8b844", style: "swept" },
  { skin: "#c9825e", hair: "#33231e", shirt: "#50a9dc", style: "crop" },
  { skin: "#f2c7a5", hair: "#49302c", shirt: "#78ba67", style: "bun" },
  { skin: "#a8664d", hair: "#171719", shirt: "#e27ca7", style: "bob" },
  { skin: "#e0a778", hair: "#76502e", shirt: "#54b5b0", style: "waves" },
] as const;

function PersonAvatar({ avatar, size = 22 }: { avatar: string; size?: number }) {
  const index = Math.max(0, Math.min(avatarLooks.length - 1, Number(avatar.slice(-1)) - 1));
  const look = avatarLooks[index] || avatarLooks[0];
  const hairStyles = {
    short: <path d="M10 21c0-9 5-14 14-14 8 0 13 5 13 13l-4-3-2-5-7 4-9 1-2 5z" />,
    long: <path d="M9 24C7 10 14 5 24 5s17 7 15 20l-3 14-5-2 1-17c-5 2-12 2-19 0l1 17-5 2z" />,
    curls: <><circle cx="13" cy="13" r="5" /><circle cx="20" cy="9" r="5" /><circle cx="28" cy="9" r="5" /><circle cx="35" cy="14" r="5" /><path d="M10 19c2-4 7-7 14-7s12 3 14 7l-3 16-5-1V21H17v13l-5 2z" /></>,
    swept: <path d="M10 21C9 11 16 6 25 6c7 0 12 4 13 11-6-1-9-4-11-7-3 5-9 8-17 8z" />,
    crop: <path d="M11 20c0-9 5-13 13-13s13 5 13 13l-4-3-2-5c-4 3-11 4-20 3z" />,
    bun: <><circle cx="33" cy="8" r="5" /><path d="M10 21C9 11 15 6 24 6s15 5 14 15l-5-4-3-6c-4 4-10 6-18 6z" /><path d="M11 21v14l5-1V20zm26 0v14l-5-1V20z" /></>,
    bob: <path d="M9 23C7 12 13 5 24 5s17 8 15 19l-4 12-5-1V20c-5 2-11 2-17 0v14l-5 1z" />,
    waves: <path d="M10 22c-2-10 4-16 14-16 9 0 15 7 13 16l-3-3-2 4-3-5-3 3-3-5-3 4-3-3-2 6-3-3-1 15-5 1z" />,
  };

  return (
    <span className={`person-avatar person-avatar-${index + 1}`} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill={`var(--avatar-bg-${index + 1})`} />
        <path d="M5 48c1-10 8-15 19-15s18 5 19 15" fill={look.shirt} />
        <path d="M9 23c0-10 6-16 15-16s15 6 15 16v8H9z" fill={look.hair} />
        <ellipse cx="10" cy="25" rx="3" ry="4" fill={look.skin} />
        <ellipse cx="38" cy="25" rx="3" ry="4" fill={look.skin} />
        <path d="M12 19c0-8 5-12 12-12s12 4 12 12v8c0 8-5 13-12 13s-12-5-12-13z" fill={look.skin} />
        <g fill={look.hair}>{hairStyles[look.style]}</g>
        <path d="M16 23c2-1 4-1 6 0m4 0c2-1 4-1 6 0" stroke={look.hair} strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="19" cy="26" rx="1.3" ry="1.7" fill="#27201e" />
        <ellipse cx="29" cy="26" rx="1.3" ry="1.7" fill="#27201e" />
        <path d="M21 33c2 2 4 2 6 0" stroke="#8b4c45" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

const stages = [
  "Computer Hardware Knowledge Assessment",
  "Data quality",
  "Matching & validation",
  "Privacy in practice",
  "Spreadsheet challenge",
];
const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const token = sessionStorage.getItem("fieldnote-admin-token");
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data as T;
};

type MusicEngine = {
  context: AudioContext;
  master: GainNode;
  step: number;
  nextTime: number;
  timer: number;
};

const musicChords = [
  { bass: 45, notes: [57, 60, 64], arp: [69, 72, 76, 72] },
  { bass: 41, notes: [53, 57, 60], arp: [65, 69, 72, 69] },
  { bass: 48, notes: [55, 60, 64], arp: [67, 72, 76, 72] },
  { bass: 43, notes: [55, 59, 62], arp: [67, 71, 74, 71] },
];
const musicStepSeconds = 0.29;

function midiToFrequency(note: number) {
  return 440 * 2 ** ((note - 69) / 12);
}

function playMusicTone(
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  peak: number,
  type: OscillatorType,
  attack = 0.02,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(midiToFrequency(note), start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function scheduleMusic(engine: MusicEngine) {
  const { context, master } = engine;
  while (engine.nextTime < context.currentTime + 0.3) {
    const now = engine.nextTime;
    const step = engine.step % 16;
    const chord = musicChords[Math.floor(step / 4)];
    const within = step % 4;
    if (within === 0) {
      chord.notes.forEach((note) =>
        playMusicTone(context, master, note, now, 1.08, 0.02, "sine", 0.3),
      );
      playMusicTone(
        context,
        master,
        chord.bass,
        now,
        0.5,
        0.055,
        "triangle",
        0.03,
      );
    }
    playMusicTone(
      context,
      master,
      chord.arp[within],
      now,
      0.2,
      0.016,
      "triangle",
      0.01,
    );
    if (within === 2) {
      playMusicTone(
        context,
        master,
        chord.bass + 12,
        now,
        0.18,
        0.018,
        "sine",
        0.01,
      );
    }
    engine.step += 1;
    engine.nextTime += musicStepSeconds;
  }
}

function App() {
  const params = new URLSearchParams(location.search);
  const joinCode = params.get("join")?.toUpperCase() || "";
  const projectorCode = params.get("projector")?.toUpperCase() || "";
  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState(
    () => sessionStorage.getItem(`participant:${joinCode}`) || "",
  );
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [marked, setMarked] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("fieldnote-admin-token") || "");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authTab, setAuthTab] = useState<"signin" | "register">("signin");
  const [regCode, setRegCode] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [projectorOpen, setProjectorOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(0);
  const [editableStages, setEditableStages] = useState<EditableQuestion[][]>([]);
  const [editorBusy, setEditorBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(
    () => localStorage.getItem("fieldnote-sound") === "on",
  );
  const [musicOn, setMusicOn] = useState(
    () => localStorage.getItem("fieldnote-music") !== "off",
  );
  const [externalProjector, setExternalProjector] = useState(false);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const music = useRef<MusicEngine | null>(null);
  const musicActive =
    musicOn &&
    !!session &&
    session.status !== "complete" &&
    !joinCode &&
    (!!projectorCode || !externalProjector);
  const audioContext = useRef<AudioContext | null>(null);
  const previousSecond = useRef(0);
  const previousDeadline = useRef<number | null>(null);
  const revealedResultKey = useRef("");

  function playCue(
    kind: "tick" | "submit" | "correct" | "incorrect" | "partial" | "start",
    preview = false,
  ) {
    if (!soundOn && !preview) return;
    const Context = window.AudioContext;
    if (!Context) return;
    audioContext.current ||= new Context();
    const context = audioContext.current;
    if (context.state === "suspended") void context.resume();
    const notes: Record<typeof kind, number[]> = {
      tick: [720],
      submit: [520, 680],
      correct: [660, 880, 1040],
      incorrect: [330, 260],
      partial: [520, 660],
      start: [440, 660, 880],
    };
    notes[kind].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const begins = context.currentTime + index * 0.095;
      oscillator.type = kind === "incorrect" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, begins);
      gain.gain.setValueAtTime(0.0001, begins);
      gain.gain.exponentialRampToValueAtTime(0.11, begins + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, begins + 0.13);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(begins);
      oscillator.stop(begins + 0.14);
    });
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem("fieldnote-sound", next ? "on" : "off");
    if (next) {
      const Context = window.AudioContext;
      if (Context) {
        audioContext.current ||= new Context();
        void audioContext.current.resume();
      }
      playCue("start", true);
    }
  }

  function ensureMusic() {
    if (music.current) return music.current;
    const Context = window.AudioContext;
    if (!Context) return null;
    const context = new Context();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, context.currentTime);
    const compressor = context.createDynamicsCompressor();
    master.connect(filter);
    filter.connect(compressor);
    compressor.connect(context.destination);
    music.current = {
      context,
      master,
      step: 0,
      nextTime: context.currentTime + 0.08,
      timer: 0,
    };
    return music.current;
  }

  function startMusic() {
    const engine = ensureMusic();
    if (!engine) return;
    const { context, master } = engine;
    void context
      .resume()
      .then(() => setMusicBlocked(context.state !== "running"))
      .catch(() => setMusicBlocked(true));
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(
      Math.max(0.0001, master.gain.value),
      context.currentTime,
    );
    master.gain.exponentialRampToValueAtTime(0.6, context.currentTime + 1.2);
    if (!engine.timer) {
      engine.nextTime = Math.max(
        engine.nextTime,
        context.currentTime + 0.05,
      );
      engine.timer = window.setInterval(() => scheduleMusic(engine), 120);
      scheduleMusic(engine);
    }
  }

  function stopMusic() {
    const engine = music.current;
    if (!engine) return;
    const { context, master } = engine;
    if (engine.timer) {
      window.clearInterval(engine.timer);
      engine.timer = 0;
    }
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(
      Math.max(0.0001, master.gain.value),
      context.currentTime,
    );
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
    engine.step = 0;
    engine.nextTime = context.currentTime + 0.5;
  }

  function toggleMusic() {
    const engine = music.current;
    if (musicOn && engine && engine.context.state !== "running") {
      void engine.context
        .resume()
        .then(() => setMusicBlocked(engine.context.state !== "running"))
        .catch(() => setMusicBlocked(true));
      return;
    }
    const next = !musicOn;
    setMusicOn(next);
    localStorage.setItem("fieldnote-music", next ? "on" : "off");
    if (next) {
      if (musicActive) startMusic();
    } else {
      stopMusic();
    }
  }

  async function refresh(code = session?.code || joinCode) {
    if (!code) return;
    try {
      setSession(await api<Session>(`/sessions/${code}`, participantId ? { headers: { "X-Participant-ID": participantId } } : undefined));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to connect.");
    }
  }

  useEffect(() => {
    if (!joinCode) return;
    void refresh(joinCode);
    const timer = window.setInterval(() => {
      void refresh(joinCode);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [joinCode, participantId]);

  useEffect(() => {
    if (!projectorCode) return;
    void refresh(projectorCode);
    const timer = window.setInterval(() => {
      void refresh(projectorCode);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [projectorCode]);

  useEffect(() => {
    if (!session?.code || joinCode || projectorCode || !adminToken) return;
    void refresh(session.code);
    const timer = window.setInterval(() => {
      void refresh(session.code);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [session?.code, joinCode, projectorCode, adminToken]);

  useEffect(() => {
    if (!adminToken || joinCode || projectorCode || session) return;
    void api<Session[]>('/admin/sessions')
      .then((savedSessions) => {
        const current = savedSessions.find((saved) => saved.status !== 'complete') || savedSessions[0];
        if (current) setSession(current);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not restore the host session.'));
  }, [adminToken, joinCode, projectorCode, session]);

  useEffect(() => {
    if (!session?.question?.deadline) return;
    const update = () =>
      setSeconds(
        Math.max(
          0,
          Math.ceil((session.question!.deadline - Date.now()) / 1000),
        ),
      );
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [session?.question?.deadline]);

  useEffect(() => {
    const deadline = session?.question?.deadline;
    if (!deadline || previousDeadline.current === deadline) return;
    previousDeadline.current = deadline;
    playCue("start");
  }, [session?.question?.deadline, soundOn]);

  useEffect(() => {
    if (seconds !== previousSecond.current && seconds > 0 && seconds <= 5)
      playCue("tick");
    previousSecond.current = seconds;
  }, [seconds, soundOn]);

  useEffect(() => {
    const result = session?.ownResult;
    if (session?.status !== "reveal" || !result) return;
    const key = `${session.code}:${session.stage}:${session.questionIndex}`;
    if (revealedResultKey.current === key) return;
    revealedResultKey.current = key;
    playCue(
      result.correct ? "correct" : result.correctCount > 0 ? "partial" : "incorrect",
    );
  }, [session?.status, session?.ownResult, session?.code, session?.stage, session?.questionIndex, soundOn]);

  useEffect(() => {
    if (musicActive) startMusic();
    else stopMusic();
  }, [musicActive]);

  useEffect(() => {
    if (!musicActive) return;
    const resume = () => {
      const engine = music.current;
      if (engine && engine.context.state !== "running")
        void engine.context
          .resume()
          .then(() => setMusicBlocked(engine.context.state !== "running"))
          .catch(() => setMusicBlocked(true));
    };
    document.addEventListener("pointerdown", resume);
    document.addEventListener("keydown", resume);
    return () => {
      document.removeEventListener("pointerdown", resume);
      document.removeEventListener("keydown", resume);
    };
  }, [musicActive]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === "fieldnote-music")
        setMusicOn(event.newValue !== "off");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => () => stopMusic(), []);

  useEffect(() => {
    if (joinCode || projectorCode || typeof BroadcastChannel === "undefined")
      return;
    const channel = new BroadcastChannel("fieldnote-projector");
    let timer: number | undefined;
    const release = () => {
      window.clearTimeout(timer);
      setExternalProjector(false);
    };
    channel.postMessage({ type: "projector-who" });
    channel.onmessage = (event: MessageEvent) => {
      if (event.data?.type === "projector-gone") {
        release();
        return;
      }
      if (event.data?.type !== "projector-present") return;
      setExternalProjector(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setExternalProjector(false), 75_000);
    };
    return () => {
      window.clearTimeout(timer);
      channel.close();
    };
  }, [joinCode, projectorCode]);

  useEffect(() => {
    if (!projectorCode || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("fieldnote-projector");
    const announce = () =>
      channel.postMessage({ type: "projector-present", code: projectorCode });
    channel.onmessage = (event: MessageEvent) => {
      if (event.data?.type === "projector-who") announce();
    };
    announce();
    const timer = window.setInterval(announce, 15_000);
    return () => {
      window.clearInterval(timer);
      channel.postMessage({ type: "projector-gone", code: projectorCode });
      channel.close();
    };
  }, [projectorCode]);

  async function act(path: string, body?: object) {
    if (!session) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<Session>(
        `/sessions/${session.code}${path}`,
        body
          ? { method: "POST", body: JSON.stringify(body) }
          : { method: "POST" },
      );
      if ("code" in result) setSession(result);
      return result;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to complete action.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createSession() {
    setBusy(true);
    setError("");
    try {
      setSession(await api<Session>("/sessions", { method: "POST" }));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create session.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function restartSession() {
    if (!session) return;
    if (
      !window.confirm(
        "Start this room over? All participant scores for this room will be cleared.",
      )
    )
      return;
    await act("/restart");
  }

  async function openQuestionEditor() {
    setEditorBusy(true);
    setError("");
    try {
      const result = await api<{ stages: EditableQuestion[][] }>("/admin/questions");
      setEditableStages(result.stages);
      setProjectorOpen(false);
      setEditorOpen(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load questions.");
    } finally {
      setEditorBusy(false);
    }
  }

  async function saveQuestionEditor() {
    setEditorBusy(true);
    setError("");
    try {
      const result = await api<{ saved: boolean }>("/admin/questions", {
        method: "PUT",
        body: JSON.stringify({ stages: editableStages }),
      });
      if (result.saved) setEditorOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save questions.");
    } finally {
      setEditorBusy(false);
    }
  }

  function updateQuestion(index: number, patch: Partial<EditableQuestion>) {
    setEditableStages((current) => current.map((stage, stageIndex) =>
      stageIndex !== editingStage ? stage : stage.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    ));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setEditableStages((current) => current.map((stage, stageIndex) => {
      if (stageIndex !== editingStage) return stage;
      const target = index + direction;
      if (target < 0 || target >= stage.length) return stage;
      const reordered = [...stage];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    }));
  }

  function addQuestion() {
    setEditableStages((current) => current.map((stage, stageIndex) => stageIndex === editingStage
      ? [...stage, { prompt: "New question", options: ["Choice A", "Choice B", "Choice C", "Choice D"], answer: 0, explanation: "Add an explanation." }]
      : stage,
    ));
  }

  function removeQuestion(index: number) {
    setEditableStages((current) => current.map((stage, stageIndex) => stageIndex === editingStage && stage.length > 1
      ? stage.filter((_, questionIndex) => questionIndex !== index)
      : stage,
    ));
  }

  async function signInAdmin(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ token: string }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      sessionStorage.setItem("fieldnote-admin-token", result.token);
      setAdminToken(result.token);
      setAdminPassword("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function registerAdmin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setRegSuccess("");
    if (regPassword !== regConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 14) {
      setError("Password must be at least 14 characters.");
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ registered: boolean; email: string }>("/admin/register", {
        method: "POST",
        body: JSON.stringify({ validId: regCode, email: regEmail, password: regPassword }),
      });
      if (result.registered) {
        setRegSuccess(`Account created for ${result.email}. You can now sign in.`);
        setRegCode("");
        setRegEmail("");
        setRegPassword("");
        setRegConfirm("");
        setAuthTab("signin");
        setAdminEmail(result.email);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  function signOutAdmin() {
    sessionStorage.removeItem("fieldnote-admin-token");
    setAdminToken("");
    setSession(null);
  }

  async function joinSession(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ participantId: string; session: Session }>(
        `/sessions/${joinCode}/join`,
        { method: "POST", body: JSON.stringify({ nickname, avatar }) },
      );
      sessionStorage.setItem(`participant:${joinCode}`, result.participantId);
      setParticipantId(result.participantId);
      setSession(result.session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to join.");
    } finally {
      setBusy(false);
    }
  }

  async function answer(index: number) {
    if (!session || !participantId || selected !== null) return;
    setSelected(index);
    playCue("submit");
    try {
      await api<{ recorded: boolean }>(
        `/sessions/${session.code}/answer`,
        {
          method: "POST",
          body: JSON.stringify({ participantId, answer: index }),
        },
      );
      await refresh(session.code);
    } catch (reason) {
      setSelected(null);
      setError(
        reason instanceof Error ? reason.message : "Answer was not recorded.",
      );
    }
  }

  async function submitChallenge() {
    if (!session || !participantId || selected !== null) return;
    setBusy(true);
    setError("");
    try {
      await api<{ recorded: boolean }>(`/sessions/${session.code}/answer`, {
        method: "POST",
        body: JSON.stringify({ participantId, findings: marked }),
      });
      setSelected(-1);
      await refresh(session.code);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Challenge was not recorded.",
      );
    } finally {
      setBusy(false);
    }
  }

  const isHost = !joinCode && !projectorCode;
  const ownPlayer = session?.participants.find(
    (person) => person.id === participantId,
  );
  const ordered = [...(session?.participants || [])].sort((a, b) =>
    compareStage(a, b, (session?.stage || 1) - 1),
  );
  const ranked = [...(session?.participants || [])].sort(compareTotal);
  const joinUrl = session ? `${location.origin}/?join=${session.code}` : "";

  useEffect(() => {
    setSelected(null);
    setMarked({});
  }, [session?.questionIndex, session?.stage, session?.status]);

  if (projectorCode)
    return (
      <ProjectorView
        session={session}
        code={projectorCode}
        seconds={seconds}
        error={error}
        musicOn={musicOn}
        musicBlocked={musicBlocked}
        onToggleMusic={toggleMusic}
      />
    );

  if (joinCode && !participantId)
    return (
      <main className="join-page">
        <section className="join-card">
          <a className="wordmark" href="/">
            FIELDNOTE<span> / LIVE</span>
          </a>
          <div className="join-badge">
            <Radio size={15} /> SESSION {joinCode}
          </div>
          <h1>Find your seat.</h1>
          <p className="muted">
            Choose a nickname and an avatar to join the room.
          </p>
          <form onSubmit={joinSession}>
            <label htmlFor="nickname">Nickname</label>
            <input
              id="nickname"
              autoFocus
              minLength={2}
              maxLength={18}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="e.g. Alex Demo"
              required
            />
            <label>Choose your avatar</label>
            <div className="avatar-picker">
              {avatars.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={avatar === item ? `avatar avatar-${item.slice(-1)} active` : `avatar avatar-${item.slice(-1)}`}
                  onClick={() => setAvatar(item)}
                  aria-label={`Choose person ${item.slice(-1)}`}
                  aria-pressed={avatar === item}
                >
                  <PersonAvatar avatar={item} size={24} />
                </button>
              ))}
            </div>
            {error && <p className="error">{error}</p>}
            <button className="primary full" disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <ArrowRight size={17} />
              )}{" "}
              Join the room
            </button>
          </form>
          <div className="privacy-note">
            <ShieldCheck size={15} /> Nickname only. No personal records
            collected.
          </div>
        </section>
      </main>
    );

  return (
    <main className={isHost ? "app-shell" : "player-shell"}>
      <header className="topbar">
        <a className="wordmark" href="/">
          FIELDNOTE<span> / LIVE</span>
        </a>
        <div className="top-meta">
          <span className="secure">
            <ShieldCheck size={14} /> SYNTHETIC DATA ONLY
          </span>
          {!joinCode && session && (
            <button
              className={`icon-button music-button ${musicOn && musicBlocked ? "music-blocked" : ""}`}
              title={
                !musicOn
                  ? "Play background music"
                  : musicBlocked
                    ? "The browser paused audio — click to enable music"
                    : "Mute background music"
              }
              aria-label={
                musicBlocked && musicOn
                  ? "Enable background music"
                  : "Background music"
              }
              aria-pressed={musicOn}
              onClick={toggleMusic}
            >
              <Music size={17} />
            </button>
          )}
          <button
            className="icon-button"
            title={soundOn ? "Mute sounds" : "Enable sounds"}
            aria-pressed={soundOn}
            onClick={toggleSound}
          >
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          {isHost && <span className="host-pill">HOST CONSOLE</span>}
        </div>
      </header>
      {joinCode && session && (
        <div className="player-content">
          {!ownPlayer ? (
            <div className="waiting">
              <span className="eyebrow">YOU’RE IN · {session.code}</span>
              <div className="waiting-avatar"><PersonAvatar avatar={avatar} size={42} /></div>
              <h1>Nice to have you, {nickname || "player"}.</h1>
              <p className="muted">
                The host will start when everyone is ready.
              </p>
              <div className="people-strip">
                <Users size={17} /> {session.participants.length} in the room
              </div>
            </div>
          ) : session.status === "lobby" ? (
            <div className="waiting">
              <span className="eyebrow">ROOM {session.code} · LOBBY OPEN</span>
              <div className="waiting-avatar"><PersonAvatar avatar={ownPlayer.avatar} size={42} /></div>
              <h1>You’re on the board, {ownPlayer.nickname}.</h1>
              <p className="muted">
                Keep this tab open. The first question is coming up.
              </p>
              <div className="people-strip">
                <Users size={17} /> {session.participants.length} players are
                ready
              </div>
            </div>
          ) : session.status === "paused" ? (
            <div className="waiting">
              <span className="eyebrow">STAGE {session.stage} · PAUSED</span>
              <div className="waiting-avatar"><PersonAvatar avatar={ownPlayer.avatar} size={42} /></div>
              <h1>Quick pause.</h1>
              <p className="muted">The timer is stopped. Your answer will still be waiting when play resumes.</p>
            </div>
          ) : session.status === "question" ? (
            <section className="play-panel">
              <div className="play-meta">
                <span className="eyebrow">STAGE {session.stage} / 5</span>
                <span className="timer-chip">{seconds}s</span>
              </div>
              <div className="progress-track">
                <span
                  style={{
                    width: `${Math.max(5, (1 - seconds / session.durationSeconds) * 100)}%`,
                  }}
                />
              </div>
              {session.stage === 5 ? (
                <>
                  <Challenge
                    rows={session.challengeRows || []}
                    marked={marked}
                    onMark={(id, value) =>
                      setMarked((current) => ({ ...current, [id]: value }))
                    }
                    disabled={selected !== null || seconds === 0}
                  />
                  <button
                    className="primary full challenge-submit"
                    onClick={() => void submitChallenge()}
                    disabled={
                      selected !== null ||
                      seconds === 0 ||
                      busy ||
                      Object.keys(marked).length !==
                        (session.challengeRows?.length || 0)
                    }
                  >
                    {busy ? (
                      <LoaderCircle size={17} className="spin" />
                    ) : (
                      <Check size={17} />
                    )}{" "}
                    Submit findings
                  </button>
                </>
              ) : (
                <>
                  <span className="eyebrow muted">
                    {session.stageTitle} · QUESTION {session.questionIndex + 1}
                  </span>
                  <h1>{session.question?.prompt}</h1>
                  <div className="answer-grid">
                    {session.question?.options.map((option, index) => (
                      <button
                        key={option}
                        disabled={selected !== null || seconds === 0}
                        className={`answer-option option-${index} ${selected === index ? "chosen" : ""}`}
                        onClick={() => void answer(index)}
                      >
                        <span className="answer-mark">
                          {["A", "B", "C", "D"][index]}
                        </span>
                        {option}
                        {selected === index && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                  <p className="player-foot">
                    {selected !== null
                      ? "Answer locked in. Watch the screen for results."
                      : "Choose once. Your answer is final."}
                  </p>
                </>
              )}
            </section>
          ) : session.status === "reveal" ? (
            <div className="result-view">
              <span className="eyebrow">STAGE {session.stage} · RESULTS</span>
              <Trophy size={36} />
              <h1>That’s the round.</h1>
              <p>
                {session.question?.explanation ||
                  "Nice work. The host is moving the session along."}
              </p>
              {session.ownResult && (
                <p className="answer-feedback" role="status">
                  {session.stage === 5
                    ? `${session.ownResult.correctCount} of ${session.ownResult.totalChecks} findings · ${session.ownResult.points} points`
                    : `${session.ownResult.correct ? "Correct" : "Incorrect"} · ${session.ownResult.points} points`}
                </p>
              )}
              {session.stage === 5 && (
                <ChallengeReview rows={session.challengeRows || []} />
              )}
              <Leaderboard
                participants={ordered.slice(0, 5)}
                scoreIndex={session.stage - 1}
              />
              <p className="muted">
                Your total: <strong>{(ownPlayer.total || 0).toLocaleString()}</strong>
              </p>
            </div>
          ) : (
            <div className="result-view">
              <span className="eyebrow">FINAL RESULTS</span>
              <Crown size={38} />
              <h1>Brilliant work.</h1>
              <Leaderboard participants={ranked.slice(0, 5)} final />
              <StageBreakdown scores={ownPlayer.scores || []} />
              <p className="muted">
                Final score: <strong>{(ownPlayer.total || 0).toLocaleString()}</strong>
              </p>
            </div>
          )}
        </div>
      )}
      {joinCode && !session && (
        <div className="player-content">
          <div className="waiting">
            <LoaderCircle className="spin" />
            <p>Connecting to room {joinCode}…</p>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      )}

      {isHost && !adminToken && (
        <section className="admin-login-wrap">
          <div className="admin-login">
            <span className="eyebrow">ADMINISTRATOR ACCESS</span>
            <h1>{authTab === "signin" ? "Sign in to host." : "Create an account."}</h1>
            <p className="muted">
              {authTab === "signin"
                ? "Host controls are available to authorized administrators."
                : "Enter your registration code to create a host account."}
            </p>

            {/* Tab switcher */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authTab === "signin" ? "active" : ""}`}
                onClick={() => { setAuthTab("signin"); setError(""); setRegSuccess(""); }}
              >
                <ShieldCheck size={15} /> Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${authTab === "register" ? "active" : ""}`}
                onClick={() => { setAuthTab("register"); setError(""); setRegSuccess(""); }}
              >
                <Plus size={15} /> Register
              </button>
            </div>

            {/* Success banner */}
            {regSuccess && (
              <p className="reg-success" role="status">
                <Check size={15} /> {regSuccess}
              </p>
            )}

            {/* Sign-in form */}
            {authTab === "signin" && (
              <form onSubmit={signInAdmin}>
                <label htmlFor="admin-email">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  required
                />
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  required
                />
                {error && <p className="error" role="alert">{error}</p>}
                <button className="primary full" disabled={busy}>
                  {busy ? <LoaderCircle size={17} className="spin" /> : <ShieldCheck size={17} />}{" "}
                  Sign in
                </button>
                <p className="auth-switch-hint">
                  Don't have an account?{" "}
                  <button type="button" className="link-button" onClick={() => { setAuthTab("register"); setError(""); }}>
                    Register here
                  </button>
                </p>
              </form>
            )}

            {/* Registration form */}
            {authTab === "register" && (
              <form onSubmit={registerAdmin}>
                <label htmlFor="reg-code">Registration Code</label>
                <input
                  id="reg-code"
                  type="text"
                  autoComplete="off"
                  placeholder="Enter the 6-digit code"
                  value={regCode}
                  onChange={(event) => setRegCode(event.target.value)}
                  maxLength={20}
                  required
                />
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(event) => setRegEmail(event.target.value)}
                  required
                />
                <label htmlFor="reg-password">Password <span className="muted" style={{fontWeight: 400, fontSize: "0.78em"}}>(min. 14 characters)</span></label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 14 characters"
                  value={regPassword}
                  onChange={(event) => setRegPassword(event.target.value)}
                  minLength={14}
                  required
                />
                <label htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={regConfirm}
                  onChange={(event) => setRegConfirm(event.target.value)}
                  minLength={14}
                  required
                />
                {error && <p className="error" role="alert">{error}</p>}
                <button className="primary full" disabled={busy}>
                  {busy ? <LoaderCircle size={17} className="spin" /> : <Plus size={17} />}{" "}
                  Create account
                </button>
                <p className="auth-switch-hint">
                  Already have an account?{" "}
                  <button type="button" className="link-button" onClick={() => { setAuthTab("signin"); setError(""); }}>
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </section>
      )}
      {isHost && adminToken && (
        <div className="host-layout">
          <aside className="sidebar">
            <div className="side-label">WORKSPACE</div>
            <button className={`nav-item ${!editorOpen && !projectorOpen ? "active" : ""}`} onClick={() => { setEditorOpen(false); setProjectorOpen(false); }}>
              <Radio size={17} /> Live session
            </button>
            <button className={`nav-item ${editorOpen ? "active" : ""}`} onClick={() => void openQuestionEditor()}>
              <CircleHelp size={17} /> Quiz stages
            </button>
            <button className={`nav-item ${projectorOpen ? "active" : ""}`} onClick={() => { setEditorOpen(false); setProjectorOpen(true); }}>
              <Monitor size={17} /> Projector show
            </button>
            <div className="sidebar-bottom">
              <ShieldCheck size={16} />
              <span>
                Privacy-first
                <br />
                demo environment
              </span>
            </div>
          </aside>
          <section className="host-main">
            <div className="page-heading">
              <div>
                <span className="eyebrow">LIVE CONTROL ROOM</span>
                <h1>Quiz night, in motion.</h1>
                <p>Five practical stages. One room. All examples synthetic.</p>
              </div>
              <button
                className="quiet-button"
                onClick={() => void refresh()}
                disabled={!session}
              >
                <RefreshCw size={15} /> Refresh
              </button>
              <button className="quiet-button" onClick={signOutAdmin}>Sign out</button>
            </div>
            {error && (
              <div className="error-banner">
                <X size={16} /> {error}
              </div>
            )}
            {editorOpen ? (
              <section className="editor-panel">
                <div className="editor-heading">
                  <div><span className="eyebrow">QUIZ EDITOR</span><h2>Shape the questions.</h2></div>
                  <div className="editor-actions">
                    <button className="quiet-button" onClick={addQuestion} disabled={editorBusy || editableStages[editingStage]?.length >= 20}><CirclePlus size={16} /> Add question</button>
                    <button className="primary" onClick={() => void saveQuestionEditor()} disabled={editorBusy}>{editorBusy ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />} Save changes</button>
                  </div>
                </div>
                <div className="editor-stage-tabs">{stages.slice(0, 4).map((title, index) => <button key={title} className={editingStage === index ? "editor-stage active" : "editor-stage"} onClick={() => setEditingStage(index)}>{String(index + 1).padStart(2, "0")} · {title}</button>)}</div>
                <div className="question-editor-list">
                  {(editableStages[editingStage] || []).map((question, index) => (
                    <article className="question-editor-item" key={`${editingStage}-${index}`}>
                      <div className="question-editor-top"><span className="editor-number">QUESTION {String(index + 1).padStart(2, "0")}</span><div className="editor-row-actions"><button className="icon-button" aria-label="Move question up" title="Move up" onClick={() => moveQuestion(index, -1)} disabled={index === 0}><ChevronUp size={16} /></button><button className="icon-button" aria-label="Move question down" title="Move down" onClick={() => moveQuestion(index, 1)} disabled={index === editableStages[editingStage].length - 1}><ChevronDown size={16} /></button><button className="icon-button danger-icon" aria-label="Delete question" title="Delete question" onClick={() => removeQuestion(index)} disabled={editableStages[editingStage].length <= 1}><Trash2 size={16} /></button></div></div>
                      <label>Question</label><textarea value={question.prompt} maxLength={400} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} />
                      <div className="editor-options">{question.options.map((option, optionIndex) => <label className="editor-option" key={optionIndex}><input type="radio" name={`correct-${index}`} checked={question.answer === optionIndex} onChange={() => updateQuestion(index, { answer: optionIndex })} aria-label={`Mark choice ${optionIndex + 1} as correct`} /><input value={option} maxLength={180} onChange={(event) => updateQuestion(index, { options: question.options.map((value, i) => i === optionIndex ? event.target.value : value) })} aria-label={`Choice ${optionIndex + 1}`} /></label>)}</div>
                      <label>Explanation</label><textarea value={question.explanation} maxLength={500} onChange={(event) => updateQuestion(index, { explanation: event.target.value })} />
                    </article>
                  ))}
                </div>
                <p className="editor-footnote">Changes apply to the current room and future rooms. Stage limit: 20 questions.</p>
              </section>
            ) : projectorOpen ? (
              <ProjectorPanel
                session={session}
                seconds={seconds}
                musicOn={musicOn}
                musicBlocked={musicBlocked}
                onToggleMusic={toggleMusic}
              />
            ) : !session ? (
              <section className="launch-panel">
                <div className="launch-icon">
                  <Sparkles size={24} />
                </div>
                <div>
                  <span className="eyebrow">READY WHEN YOU ARE</span>
                  <h2>Open a new room</h2>
                  <p>
                    Start a session to get a join code, link, and QR for your
                    projector.
                  </p>
                </div>
                <button
                  className="primary"
                  onClick={() => void createSession()}
                  disabled={busy}
                >
                  {busy ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <Plus size={17} />
                  )}{" "}
                  Create session
                </button>
              </section>
            ) : (
              <>
                <div className="session-banner">
                  <div className="session-code">
                    <span className="eyebrow">SESSION CODE</span>
                    <strong>{session.code}</strong>
                    <span className="status-dot">
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="session-actions">
                    <button
                      className="quiet-button"
                      onClick={() =>
                        void navigator.clipboard?.writeText(joinUrl)
                      }
                    >
                      <Copy size={15} /> Copy join link
                    </button>
                    <a
                      className="quiet-button"
                      href={joinUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={15} /> Participant view
                    </a>
                  </div>
                </div>
                <div className="host-grid">
                  <section className="control-panel">
                    <div className="panel-head">
                      <div>
                        <span className="eyebrow">NOW PLAYING</span>
                        <h2>{session.stageTitle}</h2>
                      </div>
                      <span className="stage-count">{session.stage} / 5</span>
                    </div>
                    <div className="stage-progress">
                      {stages.map((stage, index) => (
                        <div
                          className={
                            session.stage > index + 1
                              ? "stage-node done"
                              : session.stage === index + 1
                                ? "stage-node current"
                                : "stage-node"
                          }
                          key={stage}
                        >
                          <span>
                            {session.stage > index + 1 ? "✓" : `0${index + 1}`}
                          </span>
                          <small>{stage}</small>
                        </div>
                      ))}
                    </div>
                    {session.stage !== 5 && session.question && (
                      <div className="question-preview">
                        <span className="eyebrow">
                          QUESTION {session.questionIndex + 1} ·{" "}
                          {session.status === "reveal"
                            ? "ANSWER"
                            : `${seconds}s LEFT`}
                        </span>
                        <h3>{session.question.prompt}</h3>
                        <AnswerChoices
                          options={session.question.options || []}
                          answer={session.question.answer}
                          revealed={session.status === "reveal"}
                        />
                        {session.status === "reveal" &&
                          session.question.explanation && (
                            <p className="answer-explanation">
                              {session.question.explanation}
                            </p>
                          )}
                        <div className="answer-count">
                          <Users size={15} /> {session.responseCount} responses
                        </div>
                      </div>
                    )}
                    {session.stage === 5 && session.status === "question" && (
                      <div className="question-preview">
                        <span className="eyebrow">
                          SPREADSHEET CHALLENGE · {seconds}s LEFT
                        </span>
                        <h3>Find the validation issues in the demo records.</h3>
                      </div>
                    )}
                    <div className="control-actions">
                      {session.status !== "lobby" && (
                        <button
                          className="primary coral"
                          onClick={() =>
                            window.confirm(
                              "Restart this game? All scores and answers will be reset.",
                            ) && void restartSession()
                          }
                          disabled={busy}
                        >
                          <RefreshCw size={17} /> Restart game
                        </button>
                      )}
                      {session.status === "lobby" && (
                        <button
                          className="primary"
                          onClick={() => void act("/start")}
                          disabled={busy || !session.participants.length}
                        >
                          <Play size={17} /> Start quiz
                        </button>
                      )}
                      {session.status === "question" && (
                        <>
                          <button className="quiet-button" onClick={() => void act("/pause")} disabled={busy}>
                            Pause timer
                          </button>
                          <button className="primary coral" onClick={() => void act("/end-question")} disabled={busy}>
                            <Check size={17} /> End question
                          </button>
                        </>
                      )}
                      {session.status === "paused" && (
                        <button className="primary" onClick={() => void act("/resume")} disabled={busy}>
                          <Play size={17} /> Resume timer
                        </button>
                      )}
                      {session.status === "reveal" && (
                        <button
                          className="primary"
                          onClick={() => void act("/advance")}
                          disabled={busy}
                        >
                          <ArrowRight size={17} />{" "}
                          {session.stage === 5
                            ? "Finish quiz"
                            : "Next question / stage"}
                        </button>
                      )}
                      {session.status === "complete" && (
                        <>
                          <div className="complete-note">
                            <Crown size={17} /> Session complete
                          </div>
                          <button
                            className="primary"
                            onClick={() => void restartSession()}
                            disabled={busy}
                          >
                            <RefreshCw size={17} /> Play again
                          </button>
                        </>
                      )}
                    </div>
                  </section>
                  <section className="join-panel">
                    <div className="panel-head">
                      <div>
                        <span className="eyebrow">PARTICIPANTS</span>
                        <h2>Room is yours</h2>
                      </div>
                      <span className="people-count">
                        <Users size={16} /> {session.participants.length}
                      </span>
                    </div>
                    <div className="qr-wrap">
                      <QRCodeSVG
                        value={joinUrl}
                        size={132}
                        level="M"
                        includeMargin
                      />
                    </div>
                    <p className="qr-caption">Scan to join the session</p>
                    <div className="join-link">
                      {joinUrl}
                      <button
                        title="Copy link"
                        onClick={() =>
                          void navigator.clipboard?.writeText(joinUrl)
                        }
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="participant-list">
                      {session.participants.length ? (
                        session.participants.map((person, index) => (
                          <div className="participant-row" key={person.id}>
                            <PersonAvatar avatar={person.avatar} size={19} />
                            <span>{person.nickname}</span>
                            <span className="player-number">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="empty-note">
                          Waiting for the first player to scan in.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
                {session.status === "reveal" && (
                  <section className="leaderboard-panel">
                    <div>
                      <span className="eyebrow">
                        STAGE {session.stage} LEADERBOARD
                      </span>
                      <h2>Top of the round</h2>
                    </div>
                    <Leaderboard
                      participants={ordered.slice(0, 5)}
                      scoreIndex={session.stage - 1}
                    />
                  </section>
                )}
                {session.status === "complete" && (
                  <section className="leaderboard-panel">
                    <div>
                      <span className="eyebrow">FINAL RANKINGS</span>
                      <h2>Overall top five</h2>
                    </div>
                    <Leaderboard participants={ranked.slice(0, 5)} final />
                    <button
                      className="quiet-button"
                      onClick={() => downloadCsv(ranked)}
                    >
                      <Download size={15} /> Export CSV
                    </button>
                  </section>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function Leaderboard({
  participants,
  scoreIndex,
  final = false,
}: {
  participants: Participant[];
  scoreIndex?: number;
  final?: boolean;
}) {
  if (!participants.length)
    return (
      <p className="empty-note">Scores will appear here after the round.</p>
    );
  return (
    <div className="leader-list">
      {participants.map((person, index) => (
        <div className="leader-row" key={person.id}>
          <span className={`rank rank-${index + 1}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <PersonAvatar avatar={person.avatar} size={19} />
          <strong>{person.nickname}</strong>
          <span className="leader-score">
            {(final
              ? (person.total || 0)
              : (person.scores?.[scoreIndex || 0] || 0)
            ).toLocaleString()}{" "}
            <small>PTS</small>
          </span>
        </div>
      ))}
    </div>
  );
}

function StageBreakdown({ scores }: { scores: number[] }) {
  return (
    <div className="stage-breakdown" aria-label="Your stage score breakdown">
      {stages.map((stage, index) => (
        <div className="stage-breakdown-row" key={stage}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{stage}</strong>
          <b>{(scores[index] || 0).toLocaleString()} pts</b>
        </div>
      ))}
    </div>
  );
}

function AnswerChoices({
  options,
  answer,
  revealed = false,
}: {
  options: string[];
  answer?: number;
  revealed?: boolean;
}) {
  return (
    <div className={`choice-list ${revealed ? "revealed" : ""}`}>
      {options.map((option, index) => {
        const correct = revealed && answer === index;
        return (
          <div
            key={`${index}-${option}`}
            className={`choice-row option-${index} ${correct ? "correct" : ""}`}
          >
            <span className="answer-mark">{["A", "B", "C", "D"][index]}</span>
            <span className="choice-text">{option}</span>
            {correct && (
              <span className="correct-tag">
                <Check size={15} /> Correct answer
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectorView({
  session,
  code,
  seconds,
  error,
  musicOn,
  musicBlocked,
  onToggleMusic,
}: {
  session: Session | null;
  code: string;
  seconds: number;
  error: string;
  musicOn: boolean;
  musicBlocked: boolean;
  onToggleMusic: () => void;
}) {
  return (
    <main className="projector-shell">
      {session ? (
        <ProjectorScreen
          session={session}
          seconds={seconds}
          musicOn={musicOn}
          musicBlocked={musicBlocked}
          onToggleMusic={onToggleMusic}
        />
      ) : (
        <div className="projector-connecting">
          <LoaderCircle className="spin" size={34} />
          <p>Connecting to room {code}…</p>
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </main>
  );
}

function ProjectorPanel({
  session,
  seconds,
  musicOn,
  musicBlocked,
  onToggleMusic,
}: {
  session: Session | null;
  seconds: number;
  musicOn: boolean;
  musicBlocked: boolean;
  onToggleMusic: () => void;
}) {
  return (
    <section className="projector-panel">
      <div className="projector-toolbar">
        <div>
          <span className="eyebrow">PROJECTOR SHOW</span>
          <h2>Audience screen</h2>
          <p className="muted">
            Open this in a new tab, then move it to the projector. The join QR
            disappears once the quiz starts.
          </p>
        </div>
        {session && (
          <a
            className="quiet-button"
            href={`/?projector=${session.code}`}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} /> Open in new tab
          </a>
        )}
      </div>
      {session ? (
        <div className="projector-frame">
          <ProjectorScreen
            session={session}
            seconds={seconds}
            musicOn={musicOn}
            musicBlocked={musicBlocked}
            onToggleMusic={onToggleMusic}
          />
        </div>
      ) : (
        <p className="empty-note">
          Create a session first, then the projector view appears here.
        </p>
      )}
    </section>
  );
}

function ProjectorScreen({
  session,
  seconds,
  musicOn,
  musicBlocked,
  onToggleMusic,
}: {
  session: Session;
  seconds: number;
  musicOn: boolean;
  musicBlocked: boolean;
  onToggleMusic: () => void;
}) {
  const joinUrl = `${location.origin}/?join=${session.code}`;
  const stageIndex = session.stage - 1;
  const stageTop = [...session.participants].sort((a, b) =>
    compareStage(a, b, stageIndex),
  );
  const finalTop = [...session.participants].sort(compareTotal);
  const status = session.status;
  const progress = Math.max(
    0,
    Math.min(100, (1 - seconds / session.durationSeconds) * 100),
  );

  return (
    <div className="projector-screen" data-status={status}>
      <header className="projector-top">
        <span className="projector-wordmark">
          FIELDNOTE<span> / LIVE</span>
        </span>
        <span className="projector-stage">
          STAGE {session.stage} / 5 · {session.stageTitle}
        </span>
        <span className="projector-room">
          ROOM {session.code} · {session.participants.length}{" "}
          {session.participants.length === 1 ? "PLAYER" : "PLAYERS"}
        </span>
        <button
          className={`projector-music ${musicOn && musicBlocked ? "music-blocked" : ""}`}
          aria-label={
            musicBlocked && musicOn
              ? "Enable background music"
              : "Background music"
          }
          aria-pressed={musicOn}
          title={
            !musicOn
              ? "Play background music"
              : musicBlocked
                ? "The browser paused audio — click to enable music"
                : "Mute background music"
          }
          onClick={onToggleMusic}
        >
          <Music size={15} />{" "}
          {!musicOn
            ? "MUSIC OFF"
            : musicBlocked
              ? "TAP FOR MUSIC"
              : "MUSIC ON"}
        </button>
      </header>

      {status === "lobby" ? (
        <section className="projector-lobby">
          <div className="projector-join">
            <span className="eyebrow">SCAN OR TYPE TO JOIN</span>
            <h1>Join room {session.code}</h1>
            <div className="projector-qr">
              <QRCodeSVG
                value={joinUrl}
                size={260}
                level="M"
                includeMargin
              />
            </div>
            <p className="projector-url">{joinUrl}</p>
          </div>
          <div className="projector-roster">
            <span className="eyebrow">
              {session.participants.length} IN THE ROOM
            </span>
            <div className="projector-player-grid">
              {session.participants.map((person, index) => (
                <span
                  className="projector-player"
                  key={person.id || `${person.nickname}-${index}`}
                >
                  <PersonAvatar avatar={person.avatar} size={26} />
                  {person.nickname}
                </span>
              ))}
            </div>
            {!session.participants.length && (
              <p className="projector-empty">
                Waiting for the first player to join…
              </p>
            )}
          </div>
        </section>
      ) : status === "complete" ? (
        <section className="projector-final">
          <span className="eyebrow">FINAL RESULTS</span>
          <h1>Final top five</h1>
          <ProjectorLeaders participants={finalTop.slice(0, 5)} final />
        </section>
      ) : status === "reveal" ? (
        <section className="projector-reveal">
          {session.stage === 5 ? (
            <>
              <span className="eyebrow">STAGE 5 · RESULTS</span>
              <h1>The challenge is closed.</h1>
              <ChallengeReview rows={session.challengeRows || []} />
            </>
          ) : (
            <>
              <span className="eyebrow">
                QUESTION {session.questionIndex + 1} · CORRECT ANSWER
              </span>
              <h1>{session.question?.prompt}</h1>
              <AnswerChoices
                options={session.question?.options || []}
                answer={session.question?.answer}
                revealed
              />
              {session.question?.explanation && (
                <p className="projector-explanation">
                  {session.question.explanation}
                </p>
              )}
            </>
          )}
          <div className="projector-leaders-wrap">
            <span className="eyebrow">STAGE {session.stage} · TOP FIVE</span>
            <ProjectorLeaders
              participants={stageTop.slice(0, 5)}
              scoreIndex={stageIndex}
            />
          </div>
        </section>
      ) : (
        <section className="projector-question">
          {status === "paused" && (
            <span className="projector-paused">PAUSED</span>
          )}
          <div className="projector-timer-row">
            <span className="eyebrow">
              {session.stage === 5
                ? "SPREADSHEET CHALLENGE"
                : `QUESTION ${session.questionIndex + 1} OF ${session.questionCount}`}
            </span>
            <span className="projector-timer">{seconds}s</span>
          </div>
          <div className="projector-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          {session.stage === 5 ? (
            <>
              <h1>Find the issues in the demo records.</h1>
              <p className="projector-sub">
                Classify every row before the timer ends.
              </p>
              <ProjectorChallengeTable rows={session.challengeRows || []} />
            </>
          ) : (
            <>
              <h1>{session.question?.prompt}</h1>
              <AnswerChoices
                options={session.question?.options || []}
                answer={session.question?.answer}
              />
            </>
          )}
          <p className="projector-responses">
            {session.responseCount}{" "}
            {session.responseCount === 1 ? "answer" : "answers"} received
          </p>
        </section>
      )}
    </div>
  );
}

function ProjectorLeaders({
  participants,
  scoreIndex,
  final = false,
}: {
  participants: Participant[];
  scoreIndex?: number;
  final?: boolean;
}) {
  if (!participants.length)
    return <p className="projector-empty">No scores yet.</p>;
  return (
    <div className="projector-leaders">
      {participants.map((person, index) => (
        <div
          className="projector-leader"
          key={person.id || `${person.nickname}-${index}`}
        >
          <span className={`rank rank-${index + 1}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <PersonAvatar avatar={person.avatar} size={28} />
          <strong>{person.nickname}</strong>
          <span className="projector-points">
            {(final
              ? person.total || 0
              : person.scores?.[scoreIndex || 0] || 0
            ).toLocaleString()}{" "}
            <small>PTS</small>
          </span>
        </div>
      ))}
    </div>
  );
}

function ProjectorChallengeTable({ rows }: { rows: ChallengeRow[] }) {
  return (
    <div className="sheet-scroll projector-sheet">
      <table>
        <thead>
          <tr>
            <th>ROW</th>
            <th>HOUSEHOLD ID</th>
            <th>WGP ID</th>
            <th>EBT CARD</th>
            <th>PK NUMBER</th>
            <th>NAME</th>
            <th>BIRTHDAY</th>
            <th>MUNICIPALITY</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.hhid}</td>
              <td>{row.wgp || "—"}</td>
              <td>{row.ebt}</td>
              <td>{row.pk || "—"}</td>
              <td>{row.name}</td>
              <td>{row.birthday}</td>
              <td>{row.municipality}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const findingGuide: Record<string, { label: string; desc: string; example: string }> = {
  none: { label: "No issue", desc: "Row looks complete and correct.", example: "All fields filled in properly" },
  missing: { label: "Missing value", desc: "A required field is blank.", example: "WGP ID or PK number is empty" },
  date: { label: "Invalid date", desc: "Birthday doesn't exist or wrong format.", example: "31/02/2024 or month 13" },
  format: { label: "Bad format", desc: "ID or card number doesn't match the expected pattern.", example: "EBT card too short" },
  name: { label: "Name needs review", desc: "Name has digits or unexpected characters.", example: "Riley8" },
  spaces: { label: "Extra space", desc: "Leading or trailing space in an ID.", example: "HH-DEMO-1043 " },
  review: { label: "Possible match", desc: "Looks like a duplicate — needs manual review.", example: "Same birthday and ID as another row" },
};

function Challenge({
  rows,
  marked,
  onMark,
  disabled,
}: {
  rows: ChallengeRow[];
  marked: Record<string, string>;
  onMark: (id: string, value: string) => void;
  disabled: boolean;
}) {
  const total = rows.length;
  const completed = Object.keys(marked).length;
  const exampleRow = rows[0];

  return (
    <div className="challenge">
      <div className="challenge-head">
        <span className="eyebrow">STAGE 5 · FIND THE ISSUE</span>
        <span className="sheet-tag">DEMO_ROWS · {total} RECORDS</span>
      </div>

      {/* Instructions */}
      <div className="challenge-instructions">
        <h2>How to play</h2>
        <p>
          Check every demo row for data problems. Pick one finding for each row,
          then submit before the timer runs out.
        </p>
        <ol>
          <li>Scan the row from left to right.</li>
          <li>If something looks wrong, pick the matching finding.</li>
          <li>If the row looks fine, choose "No issue".</li>
          <li>You must classify all {total} rows before submitting.</li>
        </ol>
        <p className="progress-note">
          Progress: <strong>{completed} of {total}</strong> rows classified
        </p>
      </div>

      {/* Finding guide */}
      <div className="finding-guide">
        <h3>What the findings mean</h3>
        <div className="finding-grid">
          {Object.entries(findingGuide).map(([key, info]) => (
            <div key={key} className="finding-card">
              <strong>{info.label}</strong>
              <span className="finding-desc">{info.desc}</span>
              <span className="finding-example">{info.example}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Example row */}
      <div className="example-row">
        <h3>Example</h3>
        <p>
          Row <strong>{exampleRow.id}</strong> looks complete: HHID{" "}
          <code>{exampleRow.hhid}</code>, WGP ID{" "}
          <code>{exampleRow.wgp}</code>, EBT card <code>{exampleRow.ebt}</code>, PK{" "}
          <code>{exampleRow.pk}</code>, and a valid birthday. Correct finding:{" "}
          <strong>No issue</strong>.
        </p>
      </div>

      {/* Data table */}
      <div className="sheet-scroll">
        <table>
          <thead>
            <tr>
              <th>ROW</th>
              <th>HOUSEHOLD ID</th>
              <th>WGP ID</th>
              <th>EBT CARD</th>
              <th>PK NUMBER</th>
              <th>NAME</th>
              <th>BIRTHDAY</th>
              <th>MUNICIPALITY</th>
              <th>FINDING</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={marked[row.id] ? "row-done" : "row-todo"}>
                <td>{row.id}</td>
                <td>{row.hhid}</td>
                <td>{row.wgp || "—"}</td>
                <td>{row.ebt}</td>
                <td>{row.pk || "—"}</td>
                <td>{row.name}</td>
                <td>{row.birthday}</td>
                <td>{row.municipality}</td>
                <td>
                  <select
                    aria-label={`Finding for ${row.id}`}
                    value={marked[row.id] || ""}
                    disabled={disabled}
                    onChange={(event) => onMark(row.id, event.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="none">No issue</option>
                    <option value="missing">Missing value</option>
                    <option value="date">Invalid date</option>
                    <option value="format">Bad format</option>
                    <option value="name">Name needs review</option>
                    <option value="spaces">Extra space</option>
                    <option value="review">Possible match</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sheet-note">
        <ShieldCheck size={14} /> Synthetic records only · answer notes appear
        after the challenge closes.
      </p>
    </div>
  );
}
function ChallengeReview({ rows }: { rows: ChallengeRow[] }) {
  const labels: Record<string, string> = {
    none: "No issue",
    date: "Date invalid",
    missing: "Required value missing",
    format: "Identifier format",
    name: "Name needs review",
    spaces: "Whitespace",
    review: "Possible match, review",
  };
  return (
    <section className="challenge-review">
      <h2>Challenge review</h2>
      {rows.map((row) => (
        <div className="review-row" key={row.id}>
          <strong>{row.id}</strong>
          <span>{labels[row.issue || ""] || row.issue}</span>
          <p>{row.note}</p>
        </div>
      ))}
    </section>
  );
}
function downloadCsv(participants: Participant[]) {
  const rows = [
    [
      "Rank",
      "Nickname",
      "Avatar",
      "Stage 1",
      "Stage 2",
      "Stage 3",
      "Stage 4",
      "Stage 5",
      "Total",
    ],
    ...participants.map((person, index) => [
      String(index + 1),
      person.nickname,
      person.avatar,
      ...(person.scores || []).map(String),
      String(person.total || 0),
    ]),
  ];
  const content = rows
    .map((row) =>
      row.map((field) => `"${field.replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
  link.download = "quiz-results.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

export default App;
