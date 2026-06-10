import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import HealthOrb from '../../components/three/HealthOrb';
import { PageWrapper } from '../../components/animations/motion';

import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <PageWrapper className="min-h-screen flex items-center justify-between px-20">
      <div className="w-1/2 z-10">
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          Your Health, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Powered by AI
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-8">
          Predict risks, get personalized recommendations, and manage your health journey with cutting-edge explainable AI.
        </p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/auth/login')} className="btn-primary text-lg px-8 py-3">Get Started</button>
          <button className="px-8 py-3 rounded-lg font-medium border border-dark-border hover:bg-dark-card transition-colors">
            Learn More
          </button>
        </div>
      </div>
      
      <div className="w-1/2 h-[600px] relative">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          <HealthOrb color="#3B82F6" speed={1.5} distort={0.3} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>
    </PageWrapper>
  );
}
