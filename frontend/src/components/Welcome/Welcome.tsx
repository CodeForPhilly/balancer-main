import { NavLink } from "react-router-dom";

export type MenuItemProps = { url: string; title: string };

function MenuItem({ url, title }: MenuItemProps) {
  // TODO: add active class to menu links
  return (
    <li className="mb-8">
      <NavLink
        to={url}
        className=" text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
      >
        {title}
      </NavLink>
    </li>
  );
}

export default MenuItem;
