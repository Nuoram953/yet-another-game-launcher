import Section from "@render/components/new/section";
import { useBreadcrumbsContext } from "@render/context/BreadcrumbsContext";
import { useEffect } from "react";
import { Search } from "./components/Search";
import { useWishlist } from "./api/get-wishlist";
import { Item } from "./components/Item";

export const WishlistPage = () => {
  const wishlistQuery = useWishlist();
  const { setBreadcrumbs } = useBreadcrumbsContext();

  useEffect(() => {
    setBreadcrumbs([
      { path: "/", label: "Home" },
      { path: "/wishlist", label: "Wishlist" },
    ]);
  }, []);

  return (
    <div className="mx-4 flex min-h-screen flex-col gap-8 pt-16">
      <Section>
        <Section.Content>
          <Search />{" "}
        </Section.Content>
      </Section>
      <Section>
        <Section.Title title="Your Wishlist" />
        <Section.Content>
          <div className="flex flex-col gap-4">{wishlistQuery.data?.map((game) => <Item item={game} />)}</div>
        </Section.Content>
      </Section>
    </div>
  );
};
