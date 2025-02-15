import Button from "@khanacademy/wonder-blocks-button";
import {View} from "@khanacademy/wonder-blocks-core";
import * as React from "react";

import {MultiItems} from "../packages/perseus/src/index";
import {simpleQuestionShape} from "../packages/perseus/src/multi-items/__testdata__/multi-renderer.testdata";

import KEScoreUI from "./ke-score-ui";
import SideBySide from "./side-by-side";

import type {Item as MultiItem} from "../packages/perseus/src/multi-items/item-types";
import type {APIOptions, KEScore} from "../packages/perseus/src/types";

type SimpleItemRenderTree = {
    blurb: React.ReactNode;
    question: React.ReactNode;
    hints: ReadonlyArray<React.ReactNode>;
};

type Props = {
    simpleItem: MultiItem;
    children: (tree: {
        renderers: SimpleItemRenderTree;
    }) => React.ReactElement<any>;
    apiOptions?: APIOptions;
};

// Renders an assessment item (aka {_multi: ...} that conforms to the
// sample data simpleQuestionShape.
export const MultiItemRendererWithDebugUI = ({
    children,
    simpleItem,
    apiOptions,
}: Props): React.ReactElement => {
    // @ts-expect-error [FEI-5003] - TS2530 - Cannot find namespace 'MultiItems'.
    const ref = React.useRef<MultiItems.MultiRenderer>(null);
    const [state, setState] = React.useState<KEScore | null | undefined>(null);

    return (
        <SideBySide
            leftTitle="Multi Renderer"
            left={
                <>
                    <MultiItems.MultiRenderer
                        item={simpleItem}
                        shape={simpleQuestionShape}
                        ref={ref}
                    >
                        {(renderers) => {
                            return children(renderers);
                        }}
                    </MultiItems.MultiRenderer>
                    <div id="workarea" />
                    <div id="hintsarea" />
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Button
                            onClick={() => {
                                if (!ref.current) {
                                    return;
                                }
                                setState(ref.current.score());
                            }}
                        >
                            Check
                        </Button>
                    </View>
                    <KEScoreUI score={state} />
                </>
            }
            perseusObject={simpleItem}
        />
    );
};
