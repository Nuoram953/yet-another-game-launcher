import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const AccordionItem = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="mb-2 overflow-hidden rounded-lg border border-gray-200">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <div className="font-medium text-gray-900">{typeof title === "string" ? title : title}</div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180 transform" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          {typeof children === "string" ? <p className="text-gray-700">{children}</p> : children}
        </div>
      </div>
    </div>
  );
};

export const Accordion = ({ items, allowMultiple = false }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);

    if (allowMultiple) {
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
    } else {
      if (newOpenItems.has(index)) {
        newOpenItems.clear();
      } else {
        newOpenItems.clear();
        newOpenItems.add(index);
      }
    }

    setOpenItems(newOpenItems);
  };

  return (
    <div className="w-full max-w-2xl">
      {items.map((item, index) => (
        <AccordionItem key={index} title={item.title} isOpen={openItems.has(index)} onToggle={() => toggleItem(index)}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};
