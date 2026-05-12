import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

const Navbar = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  const handleLogout = async () => { await signOut(auth); };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">ফ্রিল্যান্সিং হাব</Link>
      <div className="nav-links">
        <Link to="/">হোম</Link>
        {user ? (
          <>
            <Link to="/admin">এডমিন</Link>
            <button onClick={handleLogout} className="btn-logout">লগআউট</button>
          </>
        ) : (
          <>
            <Link to="/login">লগইন</Link>
            <Link to="/register" className="btn-register">রেজিস্টার</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    fetchProjects();
    return () => unsub();
  }, []);

  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projectsArray = [];
    querySnapshot.forEach((doc) => { projectsArray.push({ ...doc.data(), id: doc.id }); });
    setProjects(projectsArray);
  };

  const handlePostProject = async (e) => {
    e.preventDefault();
    if (!user) return alert("প্রজেক্ট পোস্ট করতে লগইন করুন।");
    try {
      await addDoc(collection(db, "projects"), { title, budget, postedBy: user.email, createdAt: new Date().toLocaleString() });
      setTitle(''); setBudget('');
      alert("প্রজেক্ট পোস্ট হয়েছে!");
      fetchProjects();
    } catch (error) { alert("সমস্যা হয়েছে: " + error.message); }
  };

  return (
    <div className="home-container">
      <div className="post-section">
        <h2>নতুন প্রজেক্ট পোস্ট করুন</h2>
        <form onSubmit={handlePostProject}>
          <input type="text" placeholder="প্রজেক্টের শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" placeholder="বাজেট (যেমন: ৳৫০০০)" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          <button type="submit" className="btn-submit">পোস্ট করুন</button>
        </form>
      </div>
      <div className="projects-list">
        <h2>সাম্প্রতিক প্রজেক্ট</h2>
        {projects.length === 0 ? <p>কোনো প্রজেক্ট নেই।</p> : 
          projects.map(project => (
            <div key={project.id} className="project-card">
              <h3>{project.title}</h3>
              <p>বাজেট: <strong>{project.budget}</strong></p>
              <small>পোস্ট করেছেন: {project.postedBy} | {project.createdAt}</small>
            </div>
          ))
        }
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, password); alert("লগইন সফল!"); } 
    catch (error) { alert("লগইন ব্যর্থ: " + error.message); }
  };
  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>লগইন করুন</h2>
        <input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn-submit">লগইন</button>
        <p>একাউন্ট নেই? <Link to="/register">রেজিস্টার করুন</Link></p>
      </form>
    </div>
  );
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, "users"), { uid: userCredential.user.uid, email: email, role: "user" });
      alert("রেজিস্ট্রেশন সফল!");
    } catch (error) { alert("রেজিস্ট্রেশন ব্যর্থ: " + error.message); }
  };
  return (
    <div className="auth-container">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>নতুন একাউন্ট খুলুন</h2>
        <input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn-submit">রেজিস্টার</button>
        <p>একাউন্ট আছে? <Link to="/login">লগইন করুন</Link></p>
      </form>
    </div>
  );
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === "admin@gmail.com") { fetchAdminData(); }
    });
    return () => unsub();
  }, []);

  const fetchAdminData = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    setUsers(usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    const projSnap = await getDocs(collection(db, "projects"));
    setProjects(projSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const handleDeleteUser = async (id) => { if (window.confirm("ডিলিট করতে চান?")) { await deleteDoc(doc(db, "users", id)); fetchAdminData(); } };
  const handleDeleteProject = async (id) => { if (window.confirm("ডিলিট করতে চান?")) { await deleteDoc(doc(db, "projects", id)); fetchAdminData(); } };

  if (!user || user.email !== "admin@gmail.com") {
    return <div className="auth-container"><h2>অনুমতি নেই! শুধুমাত্র এডমিন প্রবেশ করতে পারবে।</h2></div>;
  }

  return (
    <div className="admin-container">
      <h2>এডমিন ড্যাশবোর্ড</h2>
      <div className="stats">
        <div className="stat-box">মোট ইউজার: {users.length}</div>
        <div className="stat-box">মোট প্রজেক্ট: {projects.length}</div>
      </div>
      <div className="admin-section">
        <h3>ইউজার ম্যানেজমেন্ট</h3>
        <table><thead><tr><th>ইমেইল</th><th>অ্যাকশন</th></tr></thead><tbody>
          {users.map(u => (<tr key={u.id}><td>{u.email}</td><td><button onClick={() => handleDeleteUser(u.id)} className="btn-danger">ডিলিট</button></td></tr>))}
        </tbody></table>
      </div>
      <div className="admin-section">
        <h3>প্রজেক্ট ম্যানেজমেন্ট</h3>
        <table><thead><tr><th>টাইটেল</th><th>বাজেট</th><th>অ্যাকশন</th></tr></thead><tbody>
          {projects.map(p => (<tr key={p.id}><td>{p.title}</td><td>{p.budget}</td><td><button onClick={() => handleDeleteProject(p.id)} className="btn-danger">ডিলিট</button></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}

export default App;
