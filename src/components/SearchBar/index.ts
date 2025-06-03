import { withInstall } from "@pureadmin/utils";
import searchBar from "./src/index.vue";
import type { SearchColumn, ExtraButton } from "./src/index.vue";

export type { SearchColumn, ExtraButton };
export const SearchBar = withInstall(searchBar);
