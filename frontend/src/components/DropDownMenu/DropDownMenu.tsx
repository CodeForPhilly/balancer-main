import MenuItem, { MenuItemProps } from "./MenuItem";

interface DropDownMenuProps {
  links: MenuItemProps[];
}

export const DropDownMenu = ({ links }: DropDownMenuProps) => {
  return (
    <div className="xl:px-50 absolute left-0 right-0 top-full mt-0 flex h-72 w-full flex-row rounded bg-white px-4 py-2 font-inter shadow-lg sm:px-6 md:px-8 lg:px-8 2xl:px-56">
      <div className="mr-9 w-28 "></div>
      <div className="">
        <ul className=" mb-8 mt-8">
          {links.map(({ url, title }, i) => (
            <MenuItem key={`${title}-${i}`} title={title} url={url} />
          ))}
        </ul>
      </div>
    </div>
  );
};
