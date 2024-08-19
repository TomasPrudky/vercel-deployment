import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";

const MySidebar = () => (
  <div style={{ display: "flex", height: "100%", maxHeight: "100%"}}>
    <Sidebar>
      <Menu>
        <MenuItem>Celková tabulka</MenuItem>
        <MenuItem>Premier League</MenuItem>
        <MenuItem>Serie A</MenuItem>
        <MenuItem>Něco se chystá..?</MenuItem>
      </Menu>
    </Sidebar>
    <main style={{ padding: 10 }}> Main content</main>
  </div>
);

export default MySidebar;
