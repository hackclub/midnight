<script lang="ts">
    import { onMount } from "svelte";
    import { checkHackatimeAccount, getHackatimeProjects, sendHackatimeOtp, verifyHackatimeOtp } from "$lib/auth";
    import Button from "../Button.svelte";
    import HackatimeEntry from "./HackatimeEntry.svelte";

    const { onClose }: {
        onClose: () => void;
    } = $props();

    let page: number = $state(0);

    let hasHackatime: boolean = $state(false);
    let email: string = $state("");
    let otp: string = $state("");

    let submitting: boolean = $state(false);
    let error: string = $state("");

    function nextPage() {
        page++;
    }

    function backPage() {
        page--;
    }

    function skipPage(newPage: number) {
        page = newPage;
    }

    async function checkHackatimeStatus() {
        const data = await checkHackatimeAccount();

        if (data) {
            console.log(data);

            if (data.hasHackatimeAccount) {
                hasHackatime = true;
            } else {
                hasHackatime = false;
            }
        }
    }

    onMount(async () => {
        await checkHackatimeStatus();
        if (hasHackatime) {
            page = 3;
        } else {
            page = 1;
        }
    });
</script>

<div class="modal-overlay">
    <div class="modal-box" onclick={(e) => e.stopPropagation()} role="none">
        {#if page == 0}
            <div class="modal-content">
                <h2 class="modal-title">LINK your account to hackatime</h2>
                <p class="modal-text">
                    checking if you already have a hackatime account...
                </p>
                <div></div>
            </div>
        {/if}
        {#if page == 1}
            <div class="modal-content">
                {#if hasHackatime}
                    <h2 class="modal-title">LINK your account to hackatime</h2>
                    <p class="modal-text">
                        <span style="color: #0CC71D;">hackatime account found! ✅</span> 
                        <br />
                        <i>if your aunt knew what hackatime was, she’d be proud!</i>
                    </p>

                    <Button label="Next →" onclick={nextPage}></Button>
                {:else}
                    <h2 class="modal-title">Sign up for hackatime</h2>
                    <div class="modal-text">
                        <p>We couldn't find a hackatime account associated with this email. Let's get you set up with hackatime.</p>
                        <br>
                        <strong>What is Hackatime?</strong>
                        <p>blah blah blah blah insert useful description of hackatime for people to understand it blah blah </p>
                    </div>

                    <div class="multi-button">
                        <Button label="I HAVE AN ACCOuNT" color="blue" onclick={() => skipPage(10)}></Button>
                        <Button label="SET UP Hackatime →" onclick={() => skipPage(20)}></Button>                        
                    </div>
                {/if}
            </div>
        {/if}
        {#if page == 2}
            <div class="modal-content">
                <h2 class="modal-title">Hackatime Integrity Agreement</h2>
                <div class="integrity-agreement">
                    <p>
                    Don’t cheat the time tracking system. No bots, no fake key presses, no UI manipulation. If you do, you’ll be banned from Hackatime and other participating YSWS / events / programs
                    </p><br>
                    <p>
                        <strong>By clicking "Next", you agree to the integrity agreement.</strong>
                    </p>
                </div>
                <Button label="Next →" onclick={nextPage}></Button>
            </div>
        {/if}
        <!-- {#if page == 3}
            <div class="modal-content">
                <h2 class="modal-title">Link a hackatime project</h2>
                {#if selectedHackatimeProjects.length}
                    <div class="hackatime-projects">
                        {#each selectedHackatimeProjects as project}
                            <HackatimeEntry 
                                projectName={project}
                                action="remove"
                                actionFn={() => removeProject(project)}
                            />
                        {/each}
                    </div>
                {:else}
                    <HackatimeEntry variant="empty" projectName="No projects selected" />
                {/if}
                <div class="multi-button">
                    <Button label="+ Add Project" onclick={nextPage} color="blue" />
                    <Button label="Next →" disabled={selectedHackatimeProjects.length === 0} onclick={() => {
                        onClose(selectedHackatimeProjects);
                    }}/>
                </div>
            </div>
        {/if}
        {#if page == 4}
            <div class="modal-content">
                {#await getHackatimeProjects()}
                        <h2 class="modal-title">LINK your account to hackatime</h2>
                        <p class="modal-text">
                            getting hackatime projects...
                        </p>
                        <div></div>
                {:then projects}
                    <h2 class="modal-title">Link a hackatime project</h2>
                    {#if projects && projects.projects.length}
                        <div class="hackatime-projects-select">
                            {#each projects.projects as project}
                                <HackatimeEntry 
                                    projectName={project.name}
                                    action="add"
                                    actionFn={() => trackProject(project.name)}
                                />
                            {/each}
                        </div>
                    {:else}
                        <HackatimeEntry variant="empty" projectName="No projects found" />
                        <Button label="Back" onclick={() => {
                            skipPage(3);
                        }} />
                    {/if}
                {/await}
            </div>
        {/if} -->

        {#if page == 3}
            <div class="modal-content">
                <h2 class="modal-title">FIRST PROJECT SET UP!</h2>
                <div class="sticker-showcase">
                    <p>Nice Work! You successfully set up your first project! Build and submit your first project to get this exclusive sticker!</p>
                </div>
                <Button label="Close" onclick={onClose} />
            </div>
        {/if}

        <div class="modal-content">
            {#if page == 10}
                    <h2 class="modal-title">Link hackatime account</h2>
                    <div>
                        <p class="modal-text">
                            Enter your email to link your hackatime account
                        </p>
                        <input class="modal-input" type="email" bind:value={email} placeholder="Email" />
                    </div>
                    <div class="multi-button">
                        <Button label="← BACK" onclick={() => skipPage(1)}></Button>
                        <Button label={submitting ? "loading..." : "Next →"} disabled={!email || submitting} onclick={async () => {
                            submitting = true;
                            const result = await sendHackatimeOtp(email);
                            submitting = false;
                            if (result.ok) {
                                nextPage();
                            } else {
                                try {
                                    const jsonData = await result.json();
                                    error = jsonData.error || "Failed to send OTP";
                                } catch (e) {
                                    error = "Failed to send OTP";
                                }
                            }
                        }}></Button>
                    </div>
                    {#if error}
                        <p class="modal-text error">{error}</p>
                    {/if}
            {/if}
            {#if page == 11}
                    <h2 class="modal-title">Sign up for hackatime</h2>
                    <div>
                        <p class="modal-text">
                            We sent you an OTP at {email}.<br>Enter it below:
                        </p>
                        <input class="modal-input" type="input" bind:value={otp} placeholder="OTP" />
                    </div>
                    
                    <div class="multi-button">
                        <Button label="← BACK" onclick={() => backPage()}></Button>
                        <Button label={submitting ? "loading..." : "Next →"} disabled={!otp || submitting} onclick={async () => {
                            submitting = true;
                            const result = await verifyHackatimeOtp(otp);
                            submitting = false;
                            if (result.ok) {
                                nextPage();
                            } else {
                                try {
                                    const jsonData = await result.json();
                                    error = jsonData.error || "Error verifying OTP";
                                } catch (e) {
                                    error = "Error verifying OTP";
                                }
                            }
                        }}></Button>
                        {#if error}
                            <p class="modal-text error">{error}</p>
                        {/if}
                    </div>
            {/if}
            {#if page == 12}
                <h2 class="modal-title">LINK your account to hackatime</h2>
                <p class="modal-text">
                    <span style="color: #0CC71D;">hackatime account set up! ✅</span> 
                    <br />
                    <i>if your aunt knew what hackatime was, she’d be proud!</i>
                </p>

                <Button label="Next →" onclick={() => skipPage(2)}></Button>
            {/if}

            {#if page == 20}
                <h2 class="modal-title">Set Up Hackatime</h2>
                <Button label="Open Hackatime" onclick={() => {
                    open('https://hackatime.hackclub.com')    
                }}></Button>
                <div class="multi-button">
                    <Button label="← Back" onclick={() => skipPage(1)}></Button>
                    <Button label="Next →" onclick={nextPage}></Button>
                </div>                
            {/if}
            {#if page == 21}
                <h2 class="modal-title">Install Hackatime</h2>
                <p>Follow the instructions on the hackatime website to install the hackatime app on your device.</p>
                <div class="multi-button">
                    <Button label="← Back" disabled={submitting} onclick={backPage}></Button>
                    <Button label={submitting ? "loading..." : "Next →"} disabled={submitting} onclick={async () => {
                        submitting = true;
                        await checkHackatimeStatus(); 
                        submitting = false;
                        nextPage();
                    }}></Button>
                </div>                
            {/if}
            {#if page == 22}
                <h2 class="modal-title">Linking Hackatime</h2>
                {#if hasHackatime}
                    <p class="modal-text">
                        <span style="color: #0CC71D;">hackatime account found! ✅</span> 
                        <br />
                        <i>if your aunt knew what hackatime was, she’d be proud!</i>
                    </p>
                    <Button label="Next →" onclick={() => skipPage(3)}></Button>
                {:else}
                    <p class="modal-text">hackatime account not found</p>
                    <div class="multi-button">
                        <Button label="← Back" disabled={submitting} onclick={backPage}></Button>
                        <Button label={submitting ? "loading..." : "Refresh"} disabled={submitting} onclick={async () => {
                            submitting = true;
                            await checkHackatimeStatus(); 
                            submitting = false;
                        }}></Button>
                        <Button label="Link Manually" disabled={submitting} onclick={() => skipPage(10)} color="blue"></Button>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-box {
        position: relative;
        background-image: url("/shapes/shape-bg-1.svg");
        background-size: 100% 100%;
        background-repeat: no-repeat;
        width: 795px;
        height: 490px;
        max-width: 90vw;
        padding: 30px 37px;

        gap: 175px;
    }

    .modal-content {
        position: relative;
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    .modal-title {
        font-family: "Moga", sans-serif;
        font-size: 44px;
        color: #453b61;
        text-align: left;
        letter-spacing: -0.352px;
        line-height: 1.5;
    }

    .modal-text {
        font-family: "PT Sans", sans-serif;
        font-size: 24px;
        color: #453b61;
        text-align: left;
        letter-spacing: -0.264px;
        line-height: 1.5;
        margin: 0;
    }

    .modal-text.error {
        padding: 8px;
        background-color: #ff6b6b;
        color: white;
    }

    .modal-input {
        width: 100%;
        
        font-size: 24px;
        font-family: "PT Sans", sans-serif;

        padding: 8px 12px;
        border: 4px solid #453b61;
    }

    .modal-input:focus {
        background-color: #453b61;
        color: white;

        outline: none;
    }

    .integrity-agreement {
        font-family: "PT Sans", sans-serif;
        color: #453b61;
        text-align: left;
        letter-spacing: -0.264px;
        line-height: 1.5;
        margin: 0;

        width: 500px;

        padding: 16px;
        background-color: #efcfa9;
    }

    .multi-button {
        display: flex;
        gap: 32px;
    }

    .hackatime-projects {
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow-y: scroll;
        padding-bottom: 20px;
        height: 280px;
        border: 1px solid #453b61;
    }

    .hackatime-projects-select {
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow-y: scroll;
        padding-bottom: 20px;
        height: 400px;
    }

    @media (max-width: 820px) {
        .modal-content {
            width: 90vw;
            height: auto;
            aspect-ratio: 795 / 490;
            padding: 25px 30px;
            gap: 120px;
        }

        .modal-title {
            font-size: 26px;
        }

        .modal-text {
            font-size: 20px;
        }
    }

    @media (max-width: 480px) {
        .modal-content {
            padding: 20px 25px;
            gap: 80px;
        }

        .modal-title {
            font-size: 20px;
        }

        .modal-text {
            font-size: 16px;
        }
    }
</style>
