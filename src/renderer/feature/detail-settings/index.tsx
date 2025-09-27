import { useActiveSection } from "./hooks/useActiveSection";
import { Container } from "@render/components/layout/Container";

export const DetailsSettings = () => {
  const {
    categories,
    activeCategory,
    handleCategoryChange,
    activeSubcategory,
    ActiveComponent,
    setActiveSubcategory,
    getActivePlatform,
  } = useActiveSection();

  return (
    <div className="flex flex-col text-design-text-normal">
      <div className="flex h-full">
        <div className="flex h-full w-72 flex-col border-r border-slate-600/50">
          <div className="scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent flex-1 overflow-y-auto">
            <div className="space-y-2 py-3 pr-3">
              {Object.entries(categories).map(([key, category]) => {
                const IconComponent = category.icon;
                const hasSubcategories =
                  "subcategories" in category &&
                  category.subcategories &&
                  Object.keys(category.subcategories).length > 0;
                const isActive = activeCategory === key;

                return (
                  <div key={key} className="space-y-1">
                    <button
                      onClick={() => handleCategoryChange(key)}
                      className={`group flex w-full items-center space-x-3 px-4 py-3 text-left transition-all duration-200`}
                    >
                      <div className={`p-2 transition-all duration-200`}>
                        <IconComponent className="h-4 w-4 text-design-text-normal" />
                      </div>
                      <span
                        className={`font-medium transition-all duration-200 ${
                          isActive ? "text-design-text-normal" : "group-hover:text-design-normal text-slate-200"
                        }`}
                      >
                        {category.title}
                      </span>
                    </button>

                    {isActive && hasSubcategories && (
                      <div className="ml-4 space-y-1 duration-200 animate-in slide-in-from-left-2">
                        {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                          <button
                            key={subKey}
                            onClick={() => setActiveSubcategory(subKey)}
                            className={`group w-full px-4 py-2.5 text-left text-sm transition-all duration-200 ${
                              activeSubcategory === subKey
                                ? "animate-pulse border-2 border-design-border font-medium [animation-duration:3s]"
                                : "border border-transparent text-slate-300 hover:bg-slate-700/30 hover:text-design-text-normal"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{subcategory.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Container>
          <div className="scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent m-4 h-full w-[95%] overflow-y-auto">
            <div className="flex flex-col gap-8">
              <ActiveComponent platformId={getActivePlatform()} />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};
