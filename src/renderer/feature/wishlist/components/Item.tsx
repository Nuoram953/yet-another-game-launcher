import { IGame } from "@main/externalApi/internetGameDatabase/types";
import { IconAndText } from "@render/components/layout/Container";
import { Dropdown } from "@render/components/new/dropdown";
import { formatDateWithOrdinalYear } from "@render/utils/util";
import { Clock, EllipsisVertical, X } from "lucide-react";
import { useDeleteWishlistItem } from "../api/delete-wishlist-item";

interface ItemProps {
  item: IGame;
}

export const Item = ({ item }: ItemProps) => {
  const deleteWishlistItem = useDeleteWishlistItem({
    externalId: 0,
    mutationConfig: {
      onSuccess: () => {
        // Optionally handle success (e.g., show a notification)
      },
    },
  });

  return (
    <div className="grid grid-cols-[auto,1fr,auto] items-start gap-4 border border-design-border p-4 transition-transform hover:border-design-text-subtle">
      <img src={item.cover?.url.replace("t_thumb", "t_1080p")} className="h-full w-52 object-cover" alt={item.name} />

      <div className="flex flex-col gap-2">
        <h2 className="font-bold">{item.name}</h2>

        <div className="!mt-[-0.5rem] flex gap-4 text-sm text-design-text-subtle">
          <IconAndText icon={<Clock className="h-4 w-4" />} text={formatDateWithOrdinalYear(item.first_release_date)} />
        </div>

        <p className="line-clamp-2">{item.summary}</p>

        <div className="grid gap-2 pt-2 sm:grid-cols-3 lg:grid-cols-5">
          {item.screenshots.slice(0, 5).map((screenshot, index) => (
            <img key={index} src={screenshot.url.replace("t_thumb", "t_1080p")} className="w-fit" alt={item.name} />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Dropdown>
          <Dropdown.Trigger>
            <EllipsisVertical />
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item
              onClick={() => {
                deleteWishlistItem.mutate({ externalId: item.id });
              }}
            >
              Remove from wishlist
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </div>
    </div>
  );
};
