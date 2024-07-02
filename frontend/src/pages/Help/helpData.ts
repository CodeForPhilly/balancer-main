import MagnifyingGlassChart from "./Icons/MagnifyingGlassChart";
import UserDoctor from "./Icons/UserDoctor";
import FeedbackIcon from "./Icons/FeedbackIcon";

export interface HelpElement {
  title: string;
  paragraph: string;
  link?: string;
  Icon?: React.ComponentType;
}

export const helpData: HelpElement[] = [
  {
    title: "How To Use This Site",
    paragraph: "Visit this page to learn how to use the Balancer App.",
    link: "/how-to",
    Icon: UserDoctor,
  },
  {
    title: "Submit Feedback",
    paragraph: "Give the Balancer team feedback on your experience.",
    link: "/feedback",
    Icon: FeedbackIcon,
  },
  {
    title: "How We Get Our Data",
    paragraph: "Learn about how the Balancer team gets our data.",
    link: "/data-sources",
    Icon: MagnifyingGlassChart,
  },
];
