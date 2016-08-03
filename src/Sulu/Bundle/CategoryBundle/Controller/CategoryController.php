<?php

/*
 * This file is part of Sulu.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\CategoryBundle\Controller;

use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Routing\ClassResourceInterface;
use Hateoas\Representation\CollectionRepresentation;
use Sulu\Bundle\CategoryBundle\Category\CategoryListRepresentation;
use Sulu\Bundle\CategoryBundle\Category\CategoryManager;
use Sulu\Bundle\CategoryBundle\Category\Exception\KeyNotUniqueException;
use Sulu\Component\Rest\Exception\EntityNotFoundException;
use Sulu\Component\Rest\Exception\MissingArgumentException;
use Sulu\Component\Rest\ListBuilder\Doctrine\DoctrineListBuilder;
use Sulu\Component\Rest\ListBuilder\Doctrine\DoctrineListBuilderFactory;
use Sulu\Component\Rest\ListBuilder\Doctrine\FieldDescriptor\DoctrineFieldDescriptor;
use Sulu\Component\Rest\RestController;
use Sulu\Component\Rest\RestHelperInterface;
use Sulu\Component\Security\SecuredControllerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Makes categories available through a REST API.
 */
class CategoryController extends RestController implements ClassResourceInterface, SecuredControllerInterface
{
    /**
     * {@inheritdoc}
     */
    protected static $entityName = 'SuluCategoryBundle:Category';

    /**
     * {@inheritdoc}
     */
    protected static $entityKey = 'categories';

    /**
     * {@inheritdoc}
     */
    protected $fieldsWidth = [];

    /**
     * {@inheritdoc}
     */
    protected $bundlePrefix = 'category.category.';

    /**
     * Returns the CategoryManager.
     *
     * @return \Sulu\Bundle\CategoryBundle\Category\CategoryManager
     */
    private function getCategoryManager()
    {
        return $this->get('sulu_category.category_manager');
    }

    /**
     * Returns all fields that can be used by list.
     *
     * @Get("categories/fields")
     *
     * @param Request $request
     *
     * @return mixed
     */
    public function getFieldsAction(Request $request)
    {
        $fieldDescriptors = $this->getCategoryManager()->getFieldDescriptors($this->getLocale($request));

        // unset field descriptors which should not be used as list-column
        unset($fieldDescriptors['depth']);
        unset($fieldDescriptors['parent']);
        unset($fieldDescriptors['hasChildren']);
        unset($fieldDescriptors['locale']);
        unset($fieldDescriptors['defaultLocale']);
        unset($fieldDescriptors['lft']);
        unset($fieldDescriptors['rgt']);

        return $this->handleView($this->view(array_values($fieldDescriptors), 200));
    }

    /**
     * Get a single category for a given id.
     *
     * @param $id
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getAction($id, Request $request)
    {
        $view = $this->responseGetById(
            $id,
            function ($id) use ($request) {
                $categoryManager = $this->getCategoryManager();
                return $categoryManager->getApiObject($categoryManager->findById($id), $this->getLocale($request));
            }
        );

        return $this->handleView($view);
    }

    /**
     * Returns the children for a parent for the given key.
     *
     * @param Request $request
     * @param mixed   $parentKey
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getChildrenAction($parentKey, Request $request)
    {
        if ($request->get('flat') == 'true') {
            $list = $this->getListRepresentation($request, $parentKey);
        } else {
            $sortBy = $request->get('sortBy');
            $sortOrder = $request->get('sortOrder');
            $categoryManager = $this->getCategoryManager();
            $categories = $categoryManager->findChildren($parentKey, $sortBy, $sortOrder);
            $wrappers = $categoryManager->getApiObjects($categories, $this->getLocale($request));
            $list = new CollectionRepresentation($wrappers, self::$entityKey);
        }
        $view = $this->view($list, 200);

        return $this->handleView($view);
    }

    /**
     * Returns the subtree of the category which is assigned to the "ancestorKey" of the request.
     * If "ancestorKey" is not set, all categories are returned
     *
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function cgetAction(Request $request)
    {
        $rootKey = $request->get('ancestorKey');

        if ($request->get('flat') == 'true') {
            $list = $this->getListRepresentation($request);
        } else {
            $sortBy = $request->get('sortBy');
            $sortOrder = $request->get('sortOrder');
            $categoryManager = $this->getCategoryManager();

            $categories = $categoryManager->find($rootKey, $depth, $sortBy, $sortOrder);
            $wrappers = $categoryManager->getApiObjects($categories, $this->getLocale($request));
            $list = new CollectionRepresentation($wrappers, self::$entityKey);
        }
        $view = $this->view($list, 200);

        return $this->handleView($view);
    }

    /**
     * Adds a new category.
     *
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function postAction(Request $request)
    {
        return $this->saveEntity($request, null);
    }

    /**
     * Changes an existing category.
     *
     * @param $id
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function putAction($id, Request $request)
    {
        try {
            if (!$request->get('name')) {
                throw new MissingArgumentException(self::$entityName, 'name');
            }

            return $this->saveEntity($request, $id);
        } catch (MissingArgumentException $exc) {
            $view = $this->view($exc->toArray(), 400);

            return $this->handleView($view);
        }
    }

    /**
     * Partly changes an existing category.
     *
     * @param $id
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function patchAction(Request $request, $id)
    {
        return $this->saveEntity($request, $id);
    }

    /**
     * Deletes the category for the given id.
     *
     * @param $id
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction($id)
    {
        $view = $this->responseDelete($id, function ($id) {
            $this->getCategoryManager()->delete($id);
        });

        return $this->handleView($view);
    }

    /**
     * Handles the change of a category. Used in PUT and PATCH.
     *
     * @param $id
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function saveEntity(Request $request, $id)
    {
        try {
            $categoryManager = $this->getCategoryManager();
            $key = $request->get('key');
            $data = [
                'id' => $id,
                'key' => (empty($key)) ? null : $key,
                'name' => $request->get('name'),
                'meta' => $request->get('meta'),
                'parent' => $request->get('parent'),
                'locale' => $this->getLocale($request),
            ];
            $categoryEntity = $categoryManager->save($data, $this->getUser()->getId());
            $categoryWrapper = $categoryManager->getApiObject(
                $categoryEntity,
                $this->getLocale($request)
            );

            $view = $this->view($categoryWrapper, 200);
        } catch (EntityNotFoundException $enfe) {
            $view = $this->view($enfe->toArray(), 404);
        } catch (KeyNotUniqueException $exc) {
            $view = $this->view($exc->toArray(), 400);
        }

        return $this->handleView($view);
    }

    /**
     * Returns a Category-list-representation.
     *
     * @param Request $request
     *
     * @return CategoryListRepresentation
     */
    protected function getListRepresentation(Request $request, $parentKey = null)
    {
        /** @var RestHelperInterface $restHelper */
        $restHelper = $this->get('sulu_core.doctrine_rest_helper');

        /** @var DoctrineListBuilderFactory $factory */
        $factory = $this->get('sulu_core.doctrine_list_builder_factory');

        $listBuilder = $factory->create(self::$entityName);
        $fieldDescriptors = $this->getCategoryManager()->getFieldDescriptors($this->getLocale($request));
        $listBuilder->sort($fieldDescriptors['depth']);

        $restHelper->initializeListBuilder($listBuilder, $fieldDescriptors);

        $listBuilder->addSelectField($fieldDescriptors['depth']);
        $listBuilder->addSelectField($fieldDescriptors['parent']);
        $listBuilder->addSelectField($fieldDescriptors['locale']);
        $listBuilder->addSelectField($fieldDescriptors['defaultLocale']);
        $listBuilder->addSelectField($fieldDescriptors['lft']);
        $listBuilder->addSelectField($fieldDescriptors['rgt']);

        if ($parentKey !== null) {
            $this->addParentSelector($parentKey, $listBuilder);
        }

        // FIXME: don't do this.
        $listBuilder->limit(null);

        $results = $listBuilder->execute();
        foreach ($results as &$result) {
            $result['hasChildren'] = ($result['lft'] + 1) !== $result['rgt'];
            unset($result['lft']);
            unset($result['rgt']);
        }
        unset($result); // break the reference

        $list = new CategoryListRepresentation(
            $results,
            self::$entityKey,
            'get_categories',
            $request->query->all(),
            $listBuilder->getCurrentPage(),
            $listBuilder->getLimit(),
            $listBuilder->count()
        );

        return $list;
    }

    /**
     * append parent selector to listbuilder.
     *
     * @param $parentKey
     * @param DoctrineListBuilder $listBuilder
     */
    protected function addParentSelector($parentKey, DoctrineListBuilder $listBuilder)
    {
        $manager = $this->getCategoryManager();
        $parentEntity = $manager->findByKey($parentKey);

        $listBuilder->between(
            $manager->getFieldDescriptor(null, 'lft'),
            [$parentEntity->getLft() + 1, $parentEntity->getRgt()]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getSecurityContext()
    {
        return 'sulu.settings.categories';
    }
}
