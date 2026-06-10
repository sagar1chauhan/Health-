import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import DNAHelix from '../components/three/DNAHelix';
import { PageWrapper } from '../components/animations/motion';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-dark-bg">
      {/* 3D Background Section */}
      <div className="hidden lg:flex w-1/2 relative bg-dark-card/30 items-center justify-center border-r border-dark-border/50">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <DNAHelix count={100} length={20} radius={3} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>
        
        {/* Overlay Content */}
        <div className="z-10 text-center p-12 backdrop-blur-sm bg-dark-bg/20 rounded-2xl border border-white/5">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            HealthHub+
          </h1>
          <p className="text-slate-300 text-lg">
            Empowering your healthcare journey with next-generation AI and personalized insights.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
        
        <PageWrapper className="w-full max-w-md">
          {children}
        </PageWrapper>
      </div>
    </div>
  );
}
