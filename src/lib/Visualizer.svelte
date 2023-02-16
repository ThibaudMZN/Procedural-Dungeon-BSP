<script lang="ts">
    import { Random, MersenneTwister19937 } from "random-js";
    import { Node } from "./node";
    import { regionCenter, regionHeight, regionWidth } from "./utils";

    const width = 400;
    const height = 400;

    let showDebug = false;
    let seed = 42;
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
            const xAligned =
                (sibling.position.y >= room.position.y &&
                    sibling.position.y <= room.position.y + room.height) ||
                (sibling.position.y + sibling.height >= room.position.y &&
                    sibling.position.y + sibling.height <=
                        room.position.y + room.height);
            if (xAligned) {
                const siblingFirst = sibling.position.x < room.position.x;
                const xStart = siblingFirst
                    ? sibling.position.x + sibling.width
                    : room.position.x + room.width;
                const xStop = siblingFirst
                    ? room.position.x
                    : sibling.position.x;
                const yStart = Math.max(room.position.y, sibling.position.y);
                corridors.push({
                    position: { x: xStart, y: yStart },
                    width: Math.abs(xStop - xStart),
                    height: rng.integer(2, corridorMaxSize),
                });
                markedDone.push(room.node.id);
                continue;
            }
            const yAligned =
                (sibling.position.x >= room.position.x &&
                    sibling.position.x <= room.position.x + room.width) ||
                (sibling.position.x + sibling.width >= room.position.x &&
                    sibling.position.x + sibling.width <=
                        room.position.x + room.width);
            if (yAligned) {
                const siblingFirst = sibling.position.y < room.position.y;
                const yStart = siblingFirst
                    ? sibling.position.y + sibling.height
                    : room.position.y + room.height;
                const yStop = siblingFirst
                    ? room.position.y
                    : sibling.position.y;
                const xStart = Math.max(room.position.x, sibling.position.x);
                corridors.push({
                    position: { x: xStart, y: yStart },
                    width: rng.integer(2, corridorMaxSize),
                    height: Math.abs(yStop - yStart),
                });
                markedDone.push(room.node.id);
                continue;
            }

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
