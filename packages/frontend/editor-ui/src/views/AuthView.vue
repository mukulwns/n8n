<script setup lang="ts">
import Logo from '@/components/Logo/Logo.vue';
import SSOLogin from '@/components/SSOLogin.vue';
import type { FormFieldValueUpdate, IFormBoxConfig } from '@/Interface';
import { useSettingsStore } from '@/stores/settings.store';
import { useToast } from '@/composables/useToast';
import { useRouter } from 'vue-router';
import { VIEWS } from '@/constants';

withDefaults(
	defineProps<{
		form: IFormBoxConfig;
		formLoading?: boolean;
		subtitle?: string;
		withSso?: boolean;
	}>(),
	{
		formLoading: false,
		withSso: false,
	},
);

const emit = defineEmits<{
	update: [FormFieldValueUpdate];
	submit: [values: any];
	secondaryClick: [];
}>();

const settingsStore = useSettingsStore();
const toast = useToast();
const router = useRouter();

const onUpdate = (e: FormFieldValueUpdate) => {
	emit('update', e);
};

const onSubmit = (data: unknown) => {
	emit('submit', data);
};

const onSecondaryClick = () => {
	emit('secondaryClick');
};

const toggleSetupPage = async () => {
	try {
		await settingsStore.toggleShowSetupOnFirstLoad();
		toast.showMessage({
			title: 'Success',
			message: `Setup page ${settingsStore.showSetupPage ? 'enabled' : 'disabled'}`,
			type: 'success',
		});
	} catch (error) {
		toast.showError(error, 'Error toggling setup page');
	}
};

const {
	settings: { releaseChannel },
} = settingsStore;
</script>

<template>
	<div :class="$style.container">
		<Logo location="authView" :release-channel="releaseChannel" />
		<div v-if="subtitle" :class="$style.textContainer">
			<N8nText size="large">{{ subtitle }}</N8nText>
		</div>
		<div :class="$style.formContainer">
			<N8nFormBox
				v-bind="form"
				data-test-id="auth-form"
				:button-loading="formLoading"
				@secondary-click="onSecondaryClick"
				@submit="onSubmit"
				@update="onUpdate"
			>
				<SSOLogin v-if="withSso" />
				<N8nButton
					:disabled="formLoading"
					@click="router.push({ name: settingsStore.showSetupPage ? VIEWS.SIGNIN : VIEWS.SETUP })"
				>
					{{ settingsStore.showSetupPage ? 'Sign In' : 'Setup New Tenant' }}
				</N8nButton>
				<N8nButton :disabled="formLoading" @click="toggleSetupPage">
					{{ settingsStore.showSetupPage ? 'Disable Setup Page' : 'Enable Setup Page' }}
				</N8nButton>
			</N8nFormBox>
		</div>
	</div>
</template>

<style lang="scss" module>
body {
	background-color: var(--color-background-light);
}

.container {
	display: flex;
	align-items: center;
	flex-direction: column;
	padding-top: var(--spacing-2xl);

	> * {
		width: 352px;
	}
}

.textContainer {
	text-align: center;
}

.formContainer {
	padding-bottom: var(--spacing-xl);
}
</style>
