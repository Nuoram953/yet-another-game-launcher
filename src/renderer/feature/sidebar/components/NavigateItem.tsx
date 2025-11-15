import { useConfig } from "@render/components/ConfigProvider";
import { Badge } from "@render/components/new/badge/Badge";
import Button from "@render/components/new/button/Button";
import _ from "lodash";

interface SidebarNavigateItemProps {
  icon?: React.ReactNode;
  label: string;
  path: string;
  handleNavigate: () => void;
  count?: number;
  hideWhenZero?: boolean;
}

export const SidebarNavigateItem = ({
  icon,
  label,
  path,
  handleNavigate,
  count,
  hideWhenZero,
}: SidebarNavigateItemProps) => {
  const { config } = useConfig();

  return (
    <div className="relative flex w-full justify-between">
      <Button
        leadingIcon={icon}
        trailing={
          !_.isNil(count) &&
          !hideWhenZero &&
          config.sidebar.display.showGameCount && (
            <div className="absolute right-2">
              <Badge text={String(count)} />
            </div>
          )
        }
        intent="tertiary"
        onClick={handleNavigate}
        text={label}
        className="w-full !justify-start"
        size="md"
      />
    </div>
  );
};
