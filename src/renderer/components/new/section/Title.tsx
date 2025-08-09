const Title = ({ title }: { title: string }) => {
  return (
    <h2 className="relative mb-6 pl-5 text-2xl font-semibold text-white before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-sm before:bg-white before:content-['']">
      {title}
    </h2>
  );
};
export default Title;
