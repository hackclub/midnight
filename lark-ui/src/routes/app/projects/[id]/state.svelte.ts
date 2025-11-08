import type { Project, User, HackatimeProject } from "$lib/auth";

// export let user = $state<User | null>();
// export let project = $state<Project | null>();
// export let linkedHackatimeProjects = $state<HackatimeProject[]>([]);

type ProjectPageState = {
    openHackatimeProjectModal: boolean,
    openHackatimeAccountModal: boolean,
    user: User | null,
    project: Project | null,
    projectId: number, 
    linkedHackatimeProjects: HackatimeProject[],
    backpage: string,
}

export let projectPageState = $state<ProjectPageState>({
    openHackatimeProjectModal: false,
    openHackatimeAccountModal: false,
    user: null,
    project: null,
    linkedHackatimeProjects: [],
    backpage: '/app/projects',
    projectId: -1
})

