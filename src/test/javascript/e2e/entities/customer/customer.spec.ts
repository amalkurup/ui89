/* tslint:disable no-unused-expression */
import { browser, ExpectedConditions as ec, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../page-objects/jhi-page-objects';

import { CustomerComponentsPage, CustomerDeleteDialog, CustomerUpdatePage } from './customer.page-object';

const expect = chai.expect;

describe('Customer e2e test', () => {
    let navBarPage: NavBarPage;
    let signInPage: SignInPage;
    let customerUpdatePage: CustomerUpdatePage;
    let customerComponentsPage: CustomerComponentsPage;
    let customerDeleteDialog: CustomerDeleteDialog;

    before(async () => {
        await browser.get('/');
        navBarPage = new NavBarPage();
        signInPage = await navBarPage.getSignInPage();
        await signInPage.autoSignInUsing('admin', 'admin');
        await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
    });

    it('should load Customers', async () => {
        await navBarPage.goToEntity('customer');
        customerComponentsPage = new CustomerComponentsPage();
        await browser.wait(ec.visibilityOf(customerComponentsPage.title), 5000);
        expect(await customerComponentsPage.getTitle()).to.eq('uiApp.customer.home.title');
    });

    it('should load create Customer page', async () => {
        await customerComponentsPage.clickOnCreateButton();
        customerUpdatePage = new CustomerUpdatePage();
        expect(await customerUpdatePage.getPageTitle()).to.eq('uiApp.customer.home.createOrEditLabel');
        await customerUpdatePage.cancel();
    });

    it('should create and save Customers', async () => {
        const nbButtonsBeforeCreate = await customerComponentsPage.countDeleteButtons();

        await customerComponentsPage.clickOnCreateButton();
        await promise.all([
            customerUpdatePage.setNameInput('name'),
            customerUpdatePage.setAddrInput('addr'),
            customerUpdatePage.setContactNumberInput('5')
        ]);
        expect(await customerUpdatePage.getNameInput()).to.eq('name');
        expect(await customerUpdatePage.getAddrInput()).to.eq('addr');
        expect(await customerUpdatePage.getContactNumberInput()).to.eq('5');
        await customerUpdatePage.save();
        expect(await customerUpdatePage.getSaveButton().isPresent()).to.be.false;

        expect(await customerComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1);
    });

    it('should delete last Customer', async () => {
        const nbButtonsBeforeDelete = await customerComponentsPage.countDeleteButtons();
        await customerComponentsPage.clickOnLastDeleteButton();

        customerDeleteDialog = new CustomerDeleteDialog();
        expect(await customerDeleteDialog.getDialogTitle()).to.eq('uiApp.customer.delete.question');
        await customerDeleteDialog.clickOnConfirmButton();

        expect(await customerComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
    });

    after(async () => {
        await navBarPage.autoSignOut();
    });
});
