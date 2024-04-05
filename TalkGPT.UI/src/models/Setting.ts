import SettingOption from "./SettingOption";

export default interface Setting {
  label: string;
  id: number;
  nested?: boolean;
  list_nested?: SettingOption[];
}
