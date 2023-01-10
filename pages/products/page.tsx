import React, { useCallback, useEffect, useState } from 'react';
import { products, categories } from '@prisma/client';
import Image from 'next/image';
import { Input, Pagination, SegmentedControl, Select } from '@mantine/core';
import { CATEGORY_MAP, FILTERS, TAKE } from 'constants/products';
import { IconSearch } from '@tabler/icons';
import useDebounce from 'useDebounce';

export default function Products() {
  const [activePage, setPage] = useState(1);
  const [categories, setCategories] = useState<categories[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('-1');
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<products[]>([]);
  const [selectedFilter, setFilter] = useState<string | null>(FILTERS[0].value);
  const [keyword, setKeyword] = useState<string>('');

  useEffect(() => {
    fetch('/api/get-categories').then((res) =>
      res.json().then((data) => setCategories(data.items))
    );
  }, []);

  const debouncedValue = useDebounce(keyword);

  useEffect(() => {
    fetch(
      `/api/get-products-count?category=${selectedCategory}&contains=${debouncedValue}`
    ).then((res) =>
      res.json().then((data) => setTotal(Math.ceil(data.items / TAKE)))
    );
  }, [selectedCategory, debouncedValue]);

  useEffect(() => {
    const skip = TAKE * (activePage - 1);
    fetch(
      `/api/get-products?skip=${skip}&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedValue}`
    ).then((res) => res.json().then((data) => setProducts(data.items)));
  }, [activePage, selectedCategory, selectedFilter, debouncedValue]);

  const changeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  return (
    <div className="px-36 mt-36 mb-36">
      {categories && (
        <div className="mb-4 flex">
          <SegmentedControl
            value={selectedCategory}
            onChange={setSelectedCategory}
            data={[
              { label: 'ALL', value: '-1' },
              ...categories.map((item) => ({
                label: item.name,
                value: String(item.id),
              })),
            ]}
            color="dark"
          />
          <div className="m-auto w-36">
            <Input
              icon={<IconSearch />}
              placeholder="Search"
              value={keyword}
              onChange={changeKeyword}
            />
          </div>
          <div className="ml-auto w-28">
            <Select
              value={selectedFilter}
              onChange={setFilter}
              data={FILTERS}
            ></Select>
          </div>
        </div>
      )}
      {products && (
        <div className="grid grid-cols-3 gap-5">
          {products.map((item) => (
            <div key={item.id} style={{ maxWidth: 310 }}>
              <Image
                className="rounded"
                alt={item.name}
                src={item.image_url ?? ''}
                width={310}
                height={390}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              />
              <div className="flex">
                <span>{item.name}</span>
                <span className="ml-auto">
                  {item.price.toLocaleString('ko-KR')}원
                </span>
              </div>
              <span className="text-zinc-400">
                {CATEGORY_MAP[item.category_id + 1]}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="w-full flex mt-5">
        <Pagination
          className="m-auto"
          page={activePage}
          onChange={setPage}
          total={total}
        />
        ;
      </div>
    </div>
  );
}
