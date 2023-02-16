<script lang="ts">
    import { Random, MersenneTwister19937 } from "random-js";
    import { Node } from "./node";
    import { regionCenter, regionHeight, regionWidth } from "./utils";

    const width = 400;
    const height = 400;

    let showDebug = false;
    let seed = 69;
    let safeMargin = 0.4;
    let depth = 4;
    let minRoomSize = 20;
    let corridorMaxSize = 4;

    let root: Node<Region>;
    let rooms: Room[];
    let corridors: Corridor[];

    const initRegion: Region = {
        x: { min: 0, max: width },
        y: { min: 0, max: height },
    };

    const joinRooms = (r1: Room, r2: Room, rng: Random): Corridor | null => {
        let r1A = r1.position.y;
        let r1B = r1A + r1.height;
        let r1C = r1.position.x;
        let r1D = r1C + r1.width;
        let r2A = r2.position.y;
        let r2B = r2A + r2.height;
        let r2C = r2.position.x;
        let r2D = r2C + r2.width;

        for (let i = 0; i < 2; i++) {
            const isYAxis = i == 1;
            if (isYAxis) {
                [r1A, r1C] = [r1C, r1A];
                [r1B, r1D] = [r1D, r1B];
                [r2A, r2C] = [r2C, r2A];
                [r2B, r2D] = [r2D, r2B];
            }
            const aligned =
                (r2A > r1A && r2A < r1B) || (r2B > r1A && r2B < r1B);
            if (aligned) {
                if (r2C == r1D || r1C == r2D) return;
                const siblingFirst = r2C < r1C;
                const start = siblingFirst ? r2D : r1D;
                const stop = siblingFirst ? r1C : r2C;
                const [otherMin, otherMax] = [r1A, r1B, r2A, r2B]
                    .sort((a, b) => a - b)
                    .slice(1, 3);
                const s = rng.integer(2, corridorMaxSize);
                const valueStart = rng.integer(otherMin, otherMax - s);
                const delta = stop - start;
                return {
                    position: {
                        x: isYAxis ? valueStart : start,
                        y: isYAxis ? start : valueStart,
                    },
                    width: isYAxis ? s : delta,
                    height: isYAxis ? delta : s,
                };
            }
        }

        /* Z shaped corridor */
        // const highest =
        //     room.position.y + room.height < sibling.position.y
        //         ? room
        //         : sibling;
        // const lowest =
        //     room.position.y + room.height < sibling.position.y
        //         ? sibling
        //         : room;
        // const isRight = highest.position.x > lowest.position.x;

        // const width = rng.integer(2, corridorMaxSize);
        // const height =
        //     lowest.position.y - (highest.position.y + highest.height);
        // corridors.push({
        //     position: {
        //         x: highest.position.x,
        //         y: highest.position.y + highest.height,
        //     },
        //     width,
        //     height,
        // });
        // corridors.push({
        //     position: {
        //         x: highest.position.x,
        //         y: highest.position.y + highest.height + height,
        //     },
        //     width,
        //     height:
        //         lowest.position.y - (highest.position.y + highest.height),
        // });
    };

    $: {
        const rng = new Random(MersenneTwister19937.seed(seed));
        root = new Node<Region>(initRegion, depth, (region: Region) => {
            const direction = regionWidth(region) > regionHeight(region);
            const thisRegion = direction ? region.x : region.y;
            const otherRegion = direction ? region.y : region.x;

            const range = (thisRegion.max - thisRegion.min) * safeMargin;
            const splitValue = rng.integer(
                thisRegion.min + range,
                thisRegion.max - range
            );
            const minMaxs: MinMax[] = [
                { min: thisRegion.min, max: splitValue },
                { min: splitValue, max: thisRegion.max },
            ];
            const children: Region[] = [];
            for (const minMax of minMaxs) {
                children.push({
                    x: direction ? minMax : { ...otherRegion },
                    y: direction ? { ...otherRegion } : minMax,
                });
            }
            return [...children];
        });
        root.split();

        rooms = [];
        const lastChildren = root.getLastChildren();
        for (const node of lastChildren) {
            const region = node.data;
            const minWidth = Math.min(minRoomSize, regionWidth(region));
            const width = rng.integer(minWidth, regionWidth(region));
            const minHeight = Math.min(minRoomSize, regionHeight(region));
            const height = rng.integer(minHeight, regionHeight(region));
            const position = {
                x: rng.integer(0, regionWidth(region) - width) + region.x.min,
                y: rng.integer(0, regionHeight(region) - height) + region.y.min,
            };
            rooms.push({
                position,
                width,
                height,
                node,
            });
        }

        corridors = [];
        const markedDone: string[] = [];
        for (const room of rooms) {
            const sibling: Room = rooms.find(
                (r) => r.node.id == room.node.getSibling().id
            );
            if (markedDone.includes(sibling.node.id)) continue;
            const corridor = joinRooms(room, sibling, rng);
            if (corridor) {
                corridors.push(corridor);
                markedDone.push(room.node.id);
            }
        }
    }
</script>

<div class="container">
    <svg
        viewBox="0 0 {width} {height}"
        xmlns="http://www.w3.org/2000/svg"
        {width}
        {height}
    >
        {#if showDebug}
            {#each root.getLastChildren() as node}
                {@const sibling = node.getSibling()}
                {@const p1 = regionCenter(node.data)}
                {@const p2 = regionCenter(sibling.data)}
                <rect
                    x={node.data.x.min}
                    y={node.data.y.min}
                    width={regionWidth(node.data)}
                    height={regionHeight(node.data)}
                    stroke="#ff6496"
                    stroke-width="2"
                    fill="none"
                />
                <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#ff96ff"
                    stroke-width="2"
                />
            {/each}
        {/if}

        {#each rooms as room}
            <rect
                x={room.position.x}
                y={room.position.y}
                width={room.width}
                height={room.height}
                stroke="#64ff9677"
                stroke-width="2"
                fill="#64ff9633"
            />
        {/each}

        {#each corridors as corridor}
            <rect
                x={corridor.position.x}
                y={corridor.position.y}
                width={corridor.width}
                height={corridor.height}
                stroke="#64ffff77"
                stroke-width="2"
                fill="#64ffff33"
            />
        {/each}
    </svg>
    <div role="group">
        <label>
            <input bind:checked={showDebug} type="checkbox" name="Show debug" />
            <p>Show debug</p>
        </label>
        <label>
            <input
                bind:value={seed}
                type="range"
                name="Seed"
                min="0"
                max="1024"
            />
            <p>Seed: {seed}</p>
        </label>
        <label>
            <input
                bind:value={depth}
                type="range"
                name="Depth"
                min="1"
                max="6"
            />
            <p>Depth: {depth}</p>
        </label>
        <label>
            <input
                bind:value={safeMargin}
                type="range"
                name="Seed"
                min="0.0"
                max="0.5"
                step="0.01"
            />
            <p>Safe Margin: {(safeMargin * 200).toFixed(0)}%</p>
        </label>
        <label>
            <input
                bind:value={minRoomSize}
                type="range"
                name="Min room size"
                min="5"
                max="50"
            />
            <p>Min. Room size: {minRoomSize}</p>
        </label>
        <label>
            <input
                bind:value={corridorMaxSize}
                type="range"
                name="Corridor max size"
                min="2"
                max="20"
            />
            <p>Corridor max size: {corridorMaxSize}</p>
        </label>
    </div>
</div>

<style>
    /* svg {
        border: 2px solid white;
    } */

    .container {
        display: flex;
        gap: 2em;
    }

    [role="group"] {
        border: 2px solid white;
        padding: 2em;
        border-radius: 1em;
    }

    label {
        display: flex;
        gap: 1em;
    }
</style>
