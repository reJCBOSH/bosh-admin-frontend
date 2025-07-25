import searchBar from "./src/index.vue";
import { withInstall } from "@pureadmin/utils";

export const SearchBar = withInstall(searchBar);
export type { SearchColumn } from "./src/index.vue";
