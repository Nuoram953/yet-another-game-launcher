import Section from "@render/components/new/section";

export const YourReview = () => {
  return (
    <Section>
      <Section.Title title="Your Review" />
      <Section.Content>
        <textarea
          onChange={(e) => {
            const value = e.target.value;
          }}
          placeholder="Write a short thought…"
          className="w-full flex-1 rounded-md bg-foreground p-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={8}
        />
      </Section.Content>
    </Section>
  );
};
