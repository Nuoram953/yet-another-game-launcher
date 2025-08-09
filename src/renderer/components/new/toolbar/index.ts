import { Toolbar as BaseToolbar } from "./Toolbar";
import { ToolbarSearch } from "./ToolbarSearch";
import { ToolbarFilter } from "./ToolbarFilter";
import { ToolbarSort } from "./ToolbarSort";

type ToolbarType = typeof BaseToolbar & {
  Search: typeof ToolbarSearch;
  Filter: typeof ToolbarFilter;
  Sort: typeof ToolbarSort;
};

const Toolbar = BaseToolbar as ToolbarType;

Toolbar.Search = ToolbarSearch;
Toolbar.Filter = ToolbarFilter;
Toolbar.Sort = ToolbarSort;

export { Toolbar };
