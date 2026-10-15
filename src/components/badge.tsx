import {
  Compass,
  Plane,
  Sunrise,
  Map,
  Globe,
  Stars,
  Waves,
  Landmark,
  Train,
  Mountain,
  Code,
  Languages,
  BookOpen,
  Music,
  Camera,
  Heart,
  Hammer,
  GraduationCap,
  Footprints,
  Medal,
  Bike,
  Activity,
  Moon,
  Briefcase,
  Coins,
  ChartNoAxesCombined,
  Wallet,
  Check,
  Lightbulb,
  MessageCircle,
  Mail,
  Utensils,
  Users,
  Gift,
  Sprout,
  House,
  Tent,
  Trophy,
} from "lucide-react";
const icons: Record<string, typeof Compass> = {
  compass: Compass,
  plane: Plane,
  sunrise: Sunrise,
  map: Map,
  globe: Globe,
  stars: Stars,
  waves: Waves,
  landmark: Landmark,
  train: Train,
  mountain: Mountain,
  code: Code,
  languages: Languages,
  book: BookOpen,
  music: Music,
  camera: Camera,
  heart: Heart,
  hammer: Hammer,
  graduation: GraduationCap,
  footprints: Footprints,
  medal: Medal,
  bike: Bike,
  activity: Activity,
  moon: Moon,
  briefcase: Briefcase,
  coins: Coins,
  chart: ChartNoAxesCombined,
  wallet: Wallet,
  check: Check,
  lightbulb: Lightbulb,
  message: MessageCircle,
  mail: Mail,
  utensils: Utensils,
  users: Users,
  gift: Gift,
  sprout: Sprout,
  home: House,
  tent: Tent,
};
export default function Badge({
  icon,
  category = 0,
  large = false,
  locked = false,
}: {
  icon: string;
  category?: number;
  large?: boolean;
  locked?: boolean;
}) {
  const Icon = icons[icon] || Trophy;
  return (
    <div
      className={`badge tone-${category} ${large ? "large" : ""} ${locked ? "locked" : ""}`}
    >
      <div className="badge-inner">
        <Icon strokeWidth={1.35} />
      </div>
      <span className="badge-dot">✦</span>
    </div>
  );
}
