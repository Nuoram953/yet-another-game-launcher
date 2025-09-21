import SectionRoot from "./Section";
import Title from "./Title";
import Content from "./Content";
import Footer from "./Footer";

type SectionCompound = typeof SectionRoot & {
  Title: typeof Title;
  Content: typeof Content;
  Footer: typeof Footer;
};

const Section = SectionRoot as SectionCompound;

Section.Title = Title;
Section.Content = Content;
Section.Footer = Footer;

export default Section;
