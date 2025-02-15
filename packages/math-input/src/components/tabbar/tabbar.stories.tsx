import {action} from "@storybook/addon-actions";
import {withKnobs, select, array} from "@storybook/addon-knobs";
import * as React from "react";

import {TabbarItemForTesting as TabbarItem} from "./item";
import Tabbar from "./tabbar";

import type {TabbarItemType} from "./types";

export default {title: "Tab Bar", decorators: [withKnobs]};

export const InactiveBarItem = () => (
    <TabbarItem
        itemState="inactive"
        itemType={select(
            "Item Type",
            {
                Numbers: "Numbers",
                Geometry: "Geometry",
                Operators: "Operators",
            },
            "Numbers",
        )}
        onClick={action("onClick")}
    />
);
export const ActiveBarItem = () => (
    <TabbarItem
        itemType={select(
            "Item Type",
            {
                Numbers: "Numbers",
                Geometry: "Geometry",
                Operators: "Operators",
            },
            "Numbers",
        )}
        itemState="active"
        onClick={action("onClick")}
    />
);
export const DisabledBarItem = () => (
    <TabbarItem
        itemType={select(
            "Item Type",
            {
                Numbers: "Numbers",
                Geometry: "Geometry",
                Operators: "Operators",
            },
            "Numbers",
        )}
        itemState="disabled"
        onClick={action("onClick")}
    />
);

export const FullTabbar = () => (
    <Tabbar
        items={
            array("items", [
                "Numbers",
                "Geometry",
                "Operators",
            ]) as ReadonlyArray<TabbarItemType>
        }
        onSelect={action("selected-item")}
    />
);
