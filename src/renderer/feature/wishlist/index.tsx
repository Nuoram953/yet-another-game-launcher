import Section from "@render/components/new/section";
import { useEffect } from "react";
import { Search } from "./components/Search";
import { useWishlist } from "./api/get-wishlist";
import { Item } from "./components/Item";

export const WishlistPage = () => {
  const wishlistQuery = useWishlist();

  return (
    <div className="h-screen overflow-x-hidden overflow-y-scroll">
      <div className="mt-16">
        <Section>
          <Section.Title title="Search" />
          <Section.Content>
            <Search />{" "}
          </Section.Content>
        </Section>
        <Section>
          <Section.Title title="Your Wishlist" />
          <Section.Content>
            <div className="flex flex-col gap-8">{wishlistQuery.data?.map((game) => <Item item={game} />)}</div>
          </Section.Content>
        </Section>
      </div>
    </div>
  );
};
